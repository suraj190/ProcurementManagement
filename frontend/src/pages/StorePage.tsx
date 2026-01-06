import { useEffect, useState } from 'react';
import { api } from '../api';

type ItemResponse = {
  id: number;
  code: string;
  description: string;
  uom: string;
};

type StoreStockResponse = {
  id: number;
  item: ItemResponse;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
};

type RequisitionListItemResponse = {
  id: number;
  department: { id: number; code: string; name: string };
  status: string;
};

type RequisitionLineResponse = {
  id: number;
  item: ItemResponse;
  quantity: number;
  purpose?: string;
};

type RequisitionResponse = {
  id: number;
  reqNumber?: string;
  department: { id: number; code: string; name: string };
  requestedBy: string;
  requiredByDate?: string;
  remarks?: string;
  status: string;
  lines: RequisitionLineResponse[];
};

type StoreIssueCreateRequest = {
  requisitionId: number | '';
  issuedBy: string;
  issueDate?: string;
  remarks?: string;
  lines: { requisitionLineId: number; issuedQuantity: number }[];
};

function StorePage() {
  const [stocks, setStocks] = useState<StoreStockResponse[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionListItemResponse[]>([]);
  const [selectedRequisition, setSelectedRequisition] = useState<RequisitionResponse | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [addQty, setAddQty] = useState(0);
  const [issueForm, setIssueForm] = useState<StoreIssueCreateRequest>({
    requisitionId: '',
    issuedBy: 'store.keeper',
    issueDate: '',
    remarks: '',
    lines: []
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'issue' | 'returns'>('stock');

  // Returns form state
  const [returnForm, setReturnForm] = useState({
    storeIssueId: '' as number | '',
    departmentId: '' as number | '',
    returnedBy: 'store.keeper',
    returnDate: '',
    remarks: '',
    lines: [] as Array<{ itemId: number; returnedQuantity: number; reason: string }>
  });

  const [departments, setDepartments] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [storeIssues, setStoreIssues] = useState<Array<{ id: number; requisition: { id: number }; department: { id: number; name: string } }>>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stk, its, reqs, depts, issues] = await Promise.all([
        api.get<StoreStockResponse[]>('/store/stocks'),
        api.get<ItemResponse[]>('/items'),
        api.get<RequisitionListItemResponse[]>('/requisitions'),
        api.get<Array<{ id: number; code: string; name: string }>>('/departments'),
        api.get<Array<{ id: number; requisition: { id: number }; department: { id: number; name: string } }>>('/store/issues')
      ]);
      setStocks(stk);
      setItems(its);
      setRequisitions(reqs.filter((r) => r.status === 'APPROVED'));
      setDepartments(depts);
      setStoreIssues(issues);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedItemId || addQty <= 0) return;
    try {
      await api.post(`/store/stocks/item/${selectedItemId}/add`, { quantity: addQty });
      setAddQty(0);
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const loadRequisitionDetails = async (reqId: number) => {
    try {
      const req = await api.get<RequisitionResponse>(`/requisitions/${reqId}`);
      setSelectedRequisition(req);
      // Initialize lines with zero quantities
      setIssueForm({
        ...issueForm,
        requisitionId: reqId,
        lines: req.lines.map((line) => ({
          requisitionLineId: line.id,
          issuedQuantity: 0
        }))
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRequisitionSelect = (reqId: number | '') => {
    if (reqId === '') {
      setSelectedRequisition(null);
      setIssueForm({
        requisitionId: '',
        issuedBy: 'store.keeper',
        issueDate: '',
        remarks: '',
        lines: []
      });
    } else {
      void loadRequisitionDetails(Number(reqId));
    }
  };

  const updateLineQuantity = (lineId: number, quantity: number) => {
    setIssueForm({
      ...issueForm,
      lines: issueForm.lines.map((l) =>
        l.requisitionLineId === lineId ? { ...l, issuedQuantity: quantity } : l
      )
    });
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!issueForm.requisitionId || issueForm.lines.length === 0) {
      setError('Please select a requisition and enter quantities');
      return;
    }
    const validLines = issueForm.lines.filter((l) => l.issuedQuantity > 0);
    if (validLines.length === 0) {
      setError('At least one line must have issued quantity > 0');
      return;
    }
    try {
      const payload = {
        ...issueForm,
        requisitionId: Number(issueForm.requisitionId),
        lines: validLines.map((l) => ({
          requisitionLineId: l.requisitionLineId,
          issuedQuantity: Number(l.issuedQuantity)
        }))
      };
      await api.post('/store/issues', payload);
      setSuccess('Store issue created successfully - Stock decreased');
      setIssueForm({
        requisitionId: '',
        issuedBy: 'store.keeper',
        issueDate: '',
        remarks: '',
        lines: []
      });
      setSelectedRequisition(null);
      await loadData();
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || err.message || 'Failed to create issue');
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!returnForm.departmentId || returnForm.lines.length === 0) {
      setError('Please select department and add return items');
      return;
    }
    const validLines = returnForm.lines.filter((l) => l.returnedQuantity > 0);
    if (validLines.length === 0) {
      setError('At least one line must have returned quantity > 0');
      return;
    }
    try {
      await api.post('/store/returns', {
        storeIssueId: returnForm.storeIssueId || null,
        departmentId: Number(returnForm.departmentId),
        returnedBy: returnForm.returnedBy,
        returnDate: returnForm.returnDate || null,
        remarks: returnForm.remarks || null,
        lines: validLines.map((l) => ({
          itemId: l.itemId,
          returnedQuantity: Number(l.returnedQuantity),
          reason: l.reason || null
        }))
      });
      setSuccess('Return created successfully - Stock increased');
      setReturnForm({
        storeIssueId: '',
        departmentId: '',
        returnedBy: 'store.keeper',
        returnDate: '',
        remarks: '',
        lines: []
      });
      await loadData();
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || err.message || 'Failed to create return');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Store Management</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'stock' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'issue' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Issue
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'returns' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Returns
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', marginBottom: '1rem', color: '#fca5a5' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '6px', marginBottom: '1rem', color: '#6ee7b7' }}>
          {success}
        </div>
      )}

      {/* Stock Tab */}
      {activeTab === 'stock' && (
        <section>
          <h3>Stock Management</h3>
          <form onSubmit={handleAddStock} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ flex: 1, padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            >
              <option value="">Select item to add stock</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.code} - {it.description}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step={0.01}
              value={addQty}
              onChange={(e) => setAddQty(Number(e.target.value))}
              placeholder="Quantity"
              style={{ width: '120px', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '6px', color: '#6ee7b7', cursor: 'pointer' }}>
              Add Stock
            </button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                  <th align="left" style={{ padding: '0.75rem' }}>Item</th>
                  <th align="right">Available</th>
                  <th align="right">Reserved</th>
                  <th align="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {s.item.code} - {s.item.description}
                    </td>
                    <td align="right">{s.availableQuantity}</td>
                    <td align="right">{s.reservedQuantity}</td>
                    <td align="right">{s.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Issue Tab */}
      {activeTab === 'issue' && (
        <section>
          <h3>Issue against Approved Requisition</h3>
          <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select
              value={issueForm.requisitionId}
              onChange={(e) => handleRequisitionSelect(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            >
              <option value="">Select Approved Requisition</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.department.code}
                </option>
              ))}
            </select>

            {selectedRequisition && (
              <div style={{ border: '1px solid rgba(148, 163, 184, 0.3)', padding: '0.75rem', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.4)' }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Requisition #{selectedRequisition.id} - {selectedRequisition.department.name}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>
                  Requested by: {selectedRequisition.requestedBy}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                      <th align="left" style={{ padding: '0.5rem' }}>Item</th>
                      <th align="right">Requested</th>
                      <th align="right">Issue Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequisition.lines.map((line) => {
                      const issueLine = issueForm.lines.find((l) => l.requisitionLineId === line.id);
                      return (
                        <tr key={line.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <td style={{ padding: '0.5rem' }}>
                            {line.item.code} - {line.item.description}
                          </td>
                          <td align="right">{line.quantity}</td>
                          <td align="right">
                            <input
                              type="number"
                              min={0}
                              max={line.quantity}
                              step={0.01}
                              value={issueLine?.issuedQuantity || 0}
                              onChange={(e) => updateLineQuantity(line.id, Number(e.target.value))}
                              style={{ width: '100px', padding: '0.25rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '4px', color: '#e5e7eb' }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                placeholder="Issued by *"
                value={issueForm.issuedBy}
                onChange={(e) => setIssueForm({ ...issueForm, issuedBy: e.target.value })}
                required
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                value={issueForm.issueDate ?? ''}
                onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
            </div>
            <textarea
              placeholder="Remarks"
              value={issueForm.remarks ?? ''}
              onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
              rows={3}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />

            <button type="submit" disabled={loading || !issueForm.requisitionId || issueForm.lines.length === 0} style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontWeight: 500 }}>
              Create Issue (Decreases Stock)
            </button>
          </form>
        </section>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <section>
          <h3>Store Returns</h3>
          <form onSubmit={handleCreateReturn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Link to Store Issue (Optional)</label>
                <select
                  value={returnForm.storeIssueId}
                  onChange={(e) => setReturnForm({ ...returnForm, storeIssueId: e.target.value === '' ? '' : Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">None - Standalone Return</option>
                  {storeIssues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      Issue #{issue.id} - {issue.department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Department *</label>
                <select
                  value={returnForm.departmentId}
                  onChange={(e) => setReturnForm({ ...returnForm, departmentId: e.target.value === '' ? '' : Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                placeholder="Returned By *"
                value={returnForm.returnedBy}
                onChange={(e) => setReturnForm({ ...returnForm, returnedBy: e.target.value })}
                required
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                placeholder="Return Date"
                value={returnForm.returnDate}
                onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
            </div>
            <textarea
              placeholder="Remarks"
              value={returnForm.remarks}
              onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
              rows={2}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Return Items</label>
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, lines: [...returnForm.lines, { itemId: 0, returnedQuantity: 0, reason: '' }] })}
                  style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '6px', color: '#6ee7b7', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  + Add Item
                </button>
              </div>
              {returnForm.lines.map((line, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    value={line.itemId}
                    onChange={(e) => {
                      const newLines = [...returnForm.lines];
                      newLines[idx].itemId = Number(e.target.value);
                      setReturnForm({ ...returnForm, lines: newLines });
                    }}
                    required
                    style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                  >
                    <option value={0}>Select Item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.description}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Quantity"
                    value={line.returnedQuantity || ''}
                    onChange={(e) => {
                      const newLines = [...returnForm.lines];
                      newLines[idx].returnedQuantity = Number(e.target.value);
                      setReturnForm({ ...returnForm, lines: newLines });
                    }}
                    required
                    style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                  />
                  <input
                    placeholder="Reason"
                    value={line.reason}
                    onChange={(e) => {
                      const newLines = [...returnForm.lines];
                      newLines[idx].reason = e.target.value;
                      setReturnForm({ ...returnForm, lines: newLines });
                    }}
                    style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => setReturnForm({ ...returnForm, lines: returnForm.lines.filter((_, i) => i !== idx) })}
                    style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading || returnForm.lines.length === 0} style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '6px', color: '#6ee7b7', cursor: 'pointer', fontWeight: 500 }}>
              Create Return (Increases Stock)
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default StorePage;


