import { useEffect, useState } from 'react';
import { api } from '../api';

type ItemResponse = {
  id: number;
  code: string;
  description: string;
  uom: string;
};

type DepartmentResponse = {
  id: number;
  code: string;
  name: string;
};

type VendorResponse = {
  id: number;
  code: string;
  name: string;
};

type RequisitionListItemResponse = {
  id: number;
  department: DepartmentResponse;
  status: string;
};

type PurchaseRequisition = {
  id: number;
  prNumber?: string;
  department?: DepartmentResponse;
  requestedBy: string;
  requiredByDate?: string;
  remarks?: string;
  status: string;
  lines: Array<{
    id: number;
    item: ItemResponse;
    quantity: number;
    purpose?: string;
  }>;
};

type PurchaseOrder = {
  id: number;
  poNumber?: string;
  vendor: VendorResponse;
  department?: DepartmentResponse;
  createdBy: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  status: string;
  lines: Array<{
    id: number;
    item: ItemResponse;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
};

type GoodsReceipt = {
  id: number;
  grnNumber?: string;
  purchaseOrder: PurchaseOrder;
  vendor: VendorResponse;
  receivedBy: string;
  receiptDate?: string;
  status: string;
  lines: Array<{
    id: number;
    item: ItemResponse;
    orderedQuantity: number;
    receivedQuantity: number;
  }>;
};

function ProcurementPage() {
  const [activeTab, setActiveTab] = useState<'pr' | 'po' | 'grn'>('pr');
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionListItemResponse[]>([]);
  const [prs, setPRs] = useState<PurchaseRequisition[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [grns, setGRNs] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // PR Form state
  const [prForm, setPRForm] = useState({
    requisitionId: '' as number | '',
    departmentId: '' as number | '',
    requestedBy: '',
    requiredByDate: '',
    remarks: '',
    lines: [] as Array<{ itemId: number; quantity: number; purpose: string }>
  });

  // PO Form state
  const [poForm, setPOForm] = useState({
    purchaseRequisitionId: '' as number | '',
    vendorId: '' as number | '',
    createdBy: '',
    orderDate: '',
    expectedDeliveryDate: '',
    remarks: '',
    lines: [] as Array<{ purchaseRequisitionLineId: number; itemId: number; quantity: number; unitPrice: number; remarks: string }>
  });

  // GRN Form state
  const [grnForm, setGRNForm] = useState({
    purchaseOrderId: '' as number | '',
    receivedBy: '',
    receiptDate: '',
    remarks: '',
    lines: [] as Array<{ purchaseOrderLineId: number; itemId: number; receivedQuantity: number }>
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [its, depts, vends, reqs, prList, poList, grnList] = await Promise.all([
        api.get<ItemResponse[]>('/items'),
        api.get<DepartmentResponse[]>('/departments'),
        api.get<VendorResponse[]>('/vendors'),
        api.get<RequisitionListItemResponse[]>('/requisitions'),
        api.get<PurchaseRequisition[]>('/purchase-requisitions'),
        api.get<PurchaseOrder[]>('/purchase-orders'),
        api.get<GoodsReceipt[]>('/grns')
      ]);
      setItems(its);
      setDepartments(depts);
      setVendors(vends);
      setRequisitions(reqs.filter((r) => r.status === 'APPROVED'));
      setPRs(prList);
      setPOs(poList);
      setGRNs(grnList);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (prForm.lines.length === 0) {
      setError('Please add at least one line item');
      return;
    }
    try {
      await api.post('/purchase-requisitions', {
        requisitionId: prForm.requisitionId || null,
        departmentId: prForm.departmentId || null,
        requestedBy: prForm.requestedBy,
        requiredByDate: prForm.requiredByDate || null,
        remarks: prForm.remarks || null,
        lines: prForm.lines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          purpose: l.purpose || null
        }))
      });
      setSuccess('Purchase Requisition created successfully');
      setPRForm({
        requisitionId: '',
        departmentId: '',
        requestedBy: '',
        requiredByDate: '',
        remarks: '',
        lines: []
      });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to create PR');
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!poForm.purchaseRequisitionId || !poForm.vendorId || poForm.lines.length === 0) {
      setError('Please select PR, vendor, and add at least one line');
      return;
    }
    try {
      await api.post('/purchase-orders', {
        purchaseRequisitionId: Number(poForm.purchaseRequisitionId),
        vendorId: Number(poForm.vendorId),
        departmentId: null,
        createdBy: poForm.createdBy,
        orderDate: poForm.orderDate || null,
        expectedDeliveryDate: poForm.expectedDeliveryDate || null,
        remarks: poForm.remarks || null,
        lines: poForm.lines.map((l) => ({
          purchaseRequisitionLineId: l.purchaseRequisitionLineId,
          itemId: l.itemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          remarks: l.remarks || null
        }))
      });
      setSuccess('Purchase Order created successfully');
      setPOForm({
        purchaseRequisitionId: '',
        vendorId: '',
        createdBy: '',
        orderDate: '',
        expectedDeliveryDate: '',
        remarks: '',
        lines: []
      });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to create PO');
    }
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!grnForm.purchaseOrderId || grnForm.lines.length === 0) {
      setError('Please select PO and add at least one line');
      return;
    }
    try {
      await api.post('/grns', {
        purchaseOrderId: Number(grnForm.purchaseOrderId),
        receivedBy: grnForm.receivedBy,
        receiptDate: grnForm.receiptDate || null,
        remarks: grnForm.remarks || null,
        lines: grnForm.lines.map((l) => ({
          purchaseOrderLineId: l.purchaseOrderLineId,
          itemId: l.itemId,
          receivedQuantity: l.receivedQuantity
        }))
      });
      setSuccess('GRN created successfully - Stock updated');
      setGRNForm({
        purchaseOrderId: '',
        receivedBy: '',
        receiptDate: '',
        remarks: '',
        lines: []
      });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to create GRN');
    }
  };

  const loadPRDetails = async (prId: number) => {
    try {
      const pr = await api.get<PurchaseRequisition>(`/purchase-requisitions/${prId}`);
      setPOForm({
        ...poForm,
        purchaseRequisitionId: prId,
        lines: pr.lines.map((line) => ({
          purchaseRequisitionLineId: line.id,
          itemId: line.item.id,
          quantity: line.quantity,
          unitPrice: 0,
          remarks: ''
        }))
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const loadPODetails = async (poId: number) => {
    try {
      const po = await api.get<PurchaseOrder>(`/purchase-orders/${poId}`);
      setGRNForm({
        ...grnForm,
        purchaseOrderId: poId,
        lines: po.lines.map((line) => ({
          purchaseOrderLineId: line.id,
          itemId: line.item.id,
          receivedQuantity: line.quantity
        }))
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Procurement</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('pr')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'pr' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Purchase Requisitions
          </button>
          <button
            onClick={() => setActiveTab('po')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'po' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('grn')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'grn' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Goods Receipt (GRN)
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

      {/* Purchase Requisitions Tab */}
      {activeTab === 'pr' && (
        <div>
          <h3>Create Purchase Requisition</h3>
          <form onSubmit={handleCreatePR} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Link to Requisition (Optional)</label>
                <select
                  value={prForm.requisitionId}
                  onChange={(e) => setPRForm({ ...prForm, requisitionId: e.target.value === '' ? '' : Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">None - Standalone PR</option>
                  {requisitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Department</label>
                <select
                  value={prForm.departmentId}
                  onChange={(e) => setPRForm({ ...prForm, departmentId: e.target.value === '' ? '' : Number(e.target.value) })}
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
                placeholder="Requested By"
                value={prForm.requestedBy}
                onChange={(e) => setPRForm({ ...prForm, requestedBy: e.target.value })}
                required
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                placeholder="Required By Date"
                value={prForm.requiredByDate}
                onChange={(e) => setPRForm({ ...prForm, requiredByDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
            </div>
            <textarea
              placeholder="Remarks"
              value={prForm.remarks}
              onChange={(e) => setPRForm({ ...prForm, remarks: e.target.value })}
              rows={2}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Items</label>
                <button
                  type="button"
                  onClick={() => setPRForm({ ...prForm, lines: [...prForm.lines, { itemId: 0, quantity: 0, purpose: '' }] })}
                  style={{ padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  + Add Item
                </button>
              </div>
              {prForm.lines.map((line, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    value={line.itemId}
                    onChange={(e) => {
                      const newLines = [...prForm.lines];
                      newLines[idx].itemId = Number(e.target.value);
                      setPRForm({ ...prForm, lines: newLines });
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
                    value={line.quantity || ''}
                    onChange={(e) => {
                      const newLines = [...prForm.lines];
                      newLines[idx].quantity = Number(e.target.value);
                      setPRForm({ ...prForm, lines: newLines });
                    }}
                    required
                    style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                  />
                  <input
                    placeholder="Purpose"
                    value={line.purpose}
                    onChange={(e) => {
                      const newLines = [...prForm.lines];
                      newLines[idx].purpose = e.target.value;
                      setPRForm({ ...prForm, lines: newLines });
                    }}
                    style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => setPRForm({ ...prForm, lines: prForm.lines.filter((_, i) => i !== idx) })}
                    style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontWeight: 500 }}>
              Create Purchase Requisition
            </button>
          </form>

          <h3>Purchase Requisitions ({prs.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                  <th align="left" style={{ padding: '0.75rem' }}>PR #</th>
                  <th align="left">Department</th>
                  <th align="left">Requested By</th>
                  <th align="left">Status</th>
                  <th align="right">Lines</th>
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => (
                  <tr key={pr.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>#{pr.id}</td>
                    <td>{pr.department?.name || '-'}</td>
                    <td>{pr.requestedBy}</td>
                    <td>{pr.status}</td>
                    <td align="right">{pr.lines?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'po' && (
        <div>
          <h3>Create Purchase Order</h3>
          <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Purchase Requisition *</label>
                <select
                  value={poForm.purchaseRequisitionId}
                  onChange={(e) => {
                    const prId = e.target.value === '' ? '' : Number(e.target.value);
                    setPOForm({ ...poForm, purchaseRequisitionId: prId });
                    if (prId) void loadPRDetails(Number(prId));
                  }}
                  required
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">Select PR</option>
                  {prs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      PR #{pr.id} - {pr.requestedBy}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Vendor *</label>
                <select
                  value={poForm.vendorId}
                  onChange={(e) => setPOForm({ ...poForm, vendorId: e.target.value === '' ? '' : Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <input
                placeholder="Created By *"
                value={poForm.createdBy}
                onChange={(e) => setPOForm({ ...poForm, createdBy: e.target.value })}
                required
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                placeholder="Order Date"
                value={poForm.orderDate}
                onChange={(e) => setPOForm({ ...poForm, orderDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                placeholder="Expected Delivery"
                value={poForm.expectedDeliveryDate}
                onChange={(e) => setPOForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
            </div>
            <textarea
              placeholder="Remarks"
              value={poForm.remarks}
              onChange={(e) => setPOForm({ ...poForm, remarks: e.target.value })}
              rows={2}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />

            {poForm.lines.length > 0 && (
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>PO Lines</label>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                      <th align="left" style={{ padding: '0.5rem' }}>Item</th>
                      <th align="right">Qty</th>
                      <th align="right">Unit Price</th>
                      <th align="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poForm.lines.map((line, idx) => {
                      const item = items.find((i) => i.id === line.itemId);
                      const total = line.quantity * line.unitPrice;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <td style={{ padding: '0.5rem' }}>{item?.code || '-'}</td>
                          <td align="right">{line.quantity}</td>
                          <td align="right">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={line.unitPrice || ''}
                              onChange={(e) => {
                                const newLines = [...poForm.lines];
                                newLines[idx].unitPrice = Number(e.target.value);
                                setPOForm({ ...poForm, lines: newLines });
                              }}
                              required
                              style={{ width: '100px', padding: '0.25rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '4px', color: '#e5e7eb' }}
                            />
                          </td>
                          <td align="right">{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <button type="submit" disabled={loading || poForm.lines.length === 0} style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontWeight: 500 }}>
              Create Purchase Order
            </button>
          </form>

          <h3>Purchase Orders ({pos.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                  <th align="left" style={{ padding: '0.75rem' }}>PO #</th>
                  <th align="left">Vendor</th>
                  <th align="left">Status</th>
                  <th align="right">Lines</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>#{po.id}</td>
                    <td>{po.vendor.name}</td>
                    <td>{po.status}</td>
                    <td align="right">{po.lines?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRN Tab */}
      {activeTab === 'grn' && (
        <div>
          <h3>Create Goods Receipt (GRN)</h3>
          <form onSubmit={handleCreateGRN} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Purchase Order *</label>
              <select
                value={grnForm.purchaseOrderId}
                onChange={(e) => {
                  const poId = e.target.value === '' ? '' : Number(e.target.value);
                  setGRNForm({ ...grnForm, purchaseOrderId: poId });
                  if (poId) void loadPODetails(Number(poId));
                }}
                required
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              >
                <option value="">Select PO</option>
                {pos.map((po) => (
                  <option key={po.id} value={po.id}>
                    PO #{po.id} - {po.vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                placeholder="Received By *"
                value={grnForm.receivedBy}
                onChange={(e) => setGRNForm({ ...grnForm, receivedBy: e.target.value })}
                required
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
              <input
                type="date"
                placeholder="Receipt Date"
                value={grnForm.receiptDate}
                onChange={(e) => setGRNForm({ ...grnForm, receiptDate: e.target.value })}
                style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
              />
            </div>
            <textarea
              placeholder="Remarks"
              value={grnForm.remarks}
              onChange={(e) => setGRNForm({ ...grnForm, remarks: e.target.value })}
              rows={2}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />

            {grnForm.lines.length > 0 && (
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Receipt Lines</label>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                      <th align="left" style={{ padding: '0.5rem' }}>Item</th>
                      <th align="right">Ordered</th>
                      <th align="right">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnForm.lines.map((line, idx) => {
                      const item = items.find((i) => i.id === line.itemId);
                      const poLine = pos.find((po) => po.id === Number(grnForm.purchaseOrderId))?.lines.find((l) => l.id === line.purchaseOrderLineId);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <td style={{ padding: '0.5rem' }}>{item?.code || '-'}</td>
                          <td align="right">{poLine?.quantity || 0}</td>
                          <td align="right">
                            <input
                              type="number"
                              min={0}
                              max={poLine?.quantity || 0}
                              step={0.01}
                              value={line.receivedQuantity || ''}
                              onChange={(e) => {
                                const newLines = [...grnForm.lines];
                                newLines[idx].receivedQuantity = Number(e.target.value);
                                setGRNForm({ ...grnForm, lines: newLines });
                              }}
                              required
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

            <button type="submit" disabled={loading || grnForm.lines.length === 0} style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '6px', color: '#6ee7b7', cursor: 'pointer', fontWeight: 500 }}>
              Create GRN (Adds Stock)
            </button>
          </form>

          <h3>Goods Receipts ({grns.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                  <th align="left" style={{ padding: '0.75rem' }}>GRN #</th>
                  <th align="left">PO #</th>
                  <th align="left">Vendor</th>
                  <th align="left">Received By</th>
                  <th align="left">Status</th>
                </tr>
              </thead>
              <tbody>
                {grns.map((grn) => (
                  <tr key={grn.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>#{grn.id}</td>
                    <td>PO #{grn.purchaseOrder.id}</td>
                    <td>{grn.vendor.name}</td>
                    <td>{grn.receivedBy}</td>
                    <td>{grn.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcurementPage;

