import { useEffect, useState } from 'react';
import { api } from '../api';

type DepartmentResponse = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

type DepartmentRequest = {
  code: string;
  name: string;
  active?: boolean;
};

function MastersPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [form, setForm] = useState<DepartmentRequest>({ code: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.get<DepartmentResponse[]>('/departments');
      setDepartments(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post<DepartmentResponse>('/departments', form);
      setSuccess('Department created successfully');
      setForm({ code: '', name: '' });
      await loadDepartments();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Failed to create department');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Masters</h2>

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

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Departments</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            placeholder="Code *"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
            style={{ flex: 1, padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
          />
          <input
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ flex: 2, padding: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '6px', color: '#e5e7eb' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.5rem', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '6px', color: '#e5e7eb', cursor: 'pointer', fontWeight: 500 }}>
            Add Department
          </button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.3)' }}>
                <th align="left" style={{ padding: '0.75rem' }}>ID</th>
                <th align="left">Code</th>
                <th align="left">Name</th>
                <th align="left">Active</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <td style={{ padding: '0.75rem' }}>#{d.id}</td>
                  <td>{d.code}</td>
                  <td>{d.name}</td>
                  <td>{d.active ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default MastersPage;


