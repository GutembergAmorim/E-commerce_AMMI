import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await userService.list();
      if (res.success) setUsers(res.data);
      else setError(res.message || 'Erro ao carregar usuários');
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChangeRole = async (id, role) => {
    try {
      await userService.setRole(id, role);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const onToggleActive = async (id, isActive) => {
    try {
      await userService.setStatus(id, isActive);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await userService.remove(id);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Usuários</h1>
      {loading && <div>Carregando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
                <th>Ativo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="form-select form-select-sm" value={u.role} onChange={(e) => onChangeRole(u._id, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id={`active-${u._id}`} checked={u.isActive} onChange={(e) => onToggleActive(u._id, e.target.checked)} />
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u._id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;


