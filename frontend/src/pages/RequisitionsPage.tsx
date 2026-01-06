import { useEffect, useState } from 'react';
import { api } from '../api';

type RequisitionStatus =
  | 'DRAFT'
  | 'PENDING_HOD_APPROVAL'
  | 'REJECTED_BY_HOD'
  | 'PENDING_PLANT_HEAD_APPROVAL'
  | 'REJECTED_BY_PLANT_HEAD'
  | 'APPROVED'
  | 'CANCELLED';

type RequisitionListItemResponse = {
  id: number;
  reqNumber: string | null;
  department: { id: number; code: string; name: string };
  requestedBy: string;
  requiredByDate: string | null;
  status: RequisitionStatus;
  lineCount: number;
  createdAt: string;
};

type DepartmentResponse = {
  id: number;
  code: string;
  name: string;
};

type ItemResponse = {
  id: number;
  code: string;
  description: string;
  uom: string;
};

type RequisitionCreateRequest = {
  departmentId: number | '';
  requestedBy: string;
  requiredByDate?: string;
  remarks?: string;
  lines: { itemId: number | ''; quantity: number; purpose?: string }[];
};

function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<RequisitionListItemResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [form, setForm] = useState<RequisitionCreateRequest>({
    departmentId: '',
    requestedBy: '',
    requiredByDate: '',
    remarks: '',
    lines: [{ itemId: '', quantity: 1 }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, depts, its] = await Promise.all([
        api.get<RequisitionListItemResponse[]>('/requisitions'),
        api.get<DepartmentResponse[]>('/departments'),
        api.get<ItemResponse[]>('/items')
      ]);
      setRequisitions(reqs);
      setDepartments(depts);
      setItems(its);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateLine = (index: number, patch: Partial<RequisitionCreateRequest['lines'][number]>) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], ...patch };
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    setForm((prev) => ({ ...prev, lines: [...prev.lines, { itemId: '', quantity: 1 }] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        departmentId: Number(form.departmentId),
        lines: form.lines.map((l) => ({
          itemId: Number(l.itemId),
          quantity: Number(l.quantity),
          purpose: l.purpose
        }))
      };
      await api.post('/requisitions', payload);
      setSuccess('Requisition created successfully - Pending HOD approval');
      setForm({
        departmentId: '',
        requestedBy: '',
        requiredByDate: '',
        remarks: '',
        lines: [{ itemId: '', quantity: 1 }]
      });
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to create requisition');
    }
  };

  const act = async (id: number, action: 'approve-hod' | 'reject-hod' | 'approve-plant-head' | 'reject-plant-head') => {
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/requisitions/${id}/${action}`, { decidedBy: 'demo.user', remarks: '' });
      const actionText = action.includes('approve') ? 'approved' : 'rejected';
      setSuccess(`Requisition ${actionText} successfully`);
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to process action');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Requisitions</h2>
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

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Requisition</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value === '' ? '' : Number(e.target.value) })}
              required
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            >
              <option value="">Select Department *</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Requested by *"
              value={form.requestedBy}
              onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
              required
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />
            <input
              type="date"
              placeholder="Required By Date"
              value={form.requiredByDate}
              onChange={(e) => setForm({ ...form, requiredByDate: e.target.value })}
              style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
            />
          </div>
          <textarea
            placeholder="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            rows={2}
            style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Items</label>
              <button type="button" onClick={addLine} style={{ padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontSize: '0.85rem' }}>
                + Add Item
              </button>
            </div>
            {form.lines.map((line, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  value={line.itemId}
                  onChange={(e) => updateLine(idx, { itemId: e.target.value === '' ? '' : Number(e.target.value) })}
                  required
                  style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                >
                  <option value="">Select Item</option>
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
                  placeholder="Quantity *"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                  required
                  style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                />
                <input
                  placeholder="Purpose"
                  value={line.purpose ?? ''}
                  onChange={(e) => updateLine(idx, { purpose: e.target.value })}
                  style={{ padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) })}
                  style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontWeight: 500 }}>
            Submit Requisition
          </button>
        </form>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Requisition List ({requisitions.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                <th align="left" style={{ padding: '0.75rem' }}>ID</th>
                <th align="left">Dept</th>
                <th align="left">Requested By</th>
                <th align="left">Required By</th>
                <th align="left">Status</th>
                <th align="right">Lines</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <td style={{ padding: '0.75rem' }}>#{r.id}</td>
                  <td>{r.department.code}</td>
                  <td>{r.requestedBy}</td>
                  <td>{r.requiredByDate ?? '-'}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        background:
                          r.status === 'APPROVED'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : r.status.includes('REJECTED')
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(59, 130, 246, 0.2)',
                        color:
                          r.status === 'APPROVED'
                            ? '#6ee7b7'
                            : r.status.includes('REJECTED')
                            ? '#fca5a5'
                            : '#93c5fd'
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td align="right">{r.lineCount}</td>
                  <td>
                    {r.status === 'PENDING_HOD_APPROVAL' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => void act(r.id, 'approve-hod')}
                          style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '4px', color: '#6ee7b7', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void act(r.id, 'reject-hod')}
                          style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '4px', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'PENDING_PLANT_HEAD_APPROVAL' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => void act(r.id, 'approve-plant-head')}
                          style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '4px', color: '#6ee7b7', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void act(r.id, 'reject-plant-head')}
                          style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '4px', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default RequisitionsPage;


