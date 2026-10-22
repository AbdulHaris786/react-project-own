import { useEffect, useState } from 'react'
import './App.css'

const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales']
const statuses = ['Active', 'Inactive']

const emptyForm = {
  name: '',
  email: '',
  company: '',
  city: '',
  department: 'IT',
  status: 'Active',
}

function getRandomPhoto(index = Math.floor(Math.random() * 90)) {
  const gender = index % 2 === 0 ? 'men' : 'women'
  const number = (index % 90) + 1

  return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`
}

function App() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 10

  useEffect(() => {
    fetch('https://dummyjson.com/users?limit=50')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load employees')
        }

        return response.json()
      })
      .then((data) => {
        const employeeList = data.users.map((user, index) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          company: user.company?.name || 'Not specified',
          city: user.address?.city || 'Not specified',
          image: getRandomPhoto(index),
          department: departments[index % departments.length],
          status: index % 5 === 0 ? 'Inactive' : 'Active',
        }))

        setEmployees(employeeList)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load employees. Check your internet connection.')
        setLoading(false)
      })
  }, [])

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 3000)
  }

 const handleChange = (event) => {
  console.log(event, 'events')

  const { name, value } = event.target

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }))
}

  const openAddForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setMessage('')
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    
    console.log(event)

    console.log('Employee details:', form)

    console.log('Status:', event.currentTarget.elements.status.value)

    const details = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || 'Not specified',
      city: form.city.trim() || 'Not specified',
      department: form.department,
      status: form.status,
    }

    if (!details.name || !details.email) return

    if (editingId !== null) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingId
            ? { ...employee, ...details }
            : employee
        )
      )

      showMessage('Employee updated successfully.')
    } else {
      const newEmployee = {
        id: Date.now(),
        ...details,
        image: getRandomPhoto(),
      }

      setEmployees((previous) => [newEmployee, ...previous])
      showMessage('Employee added successfully.')
    }

    closeForm()
    setSearch('')
    setDepartmentFilter('All')
    setStatusFilter('All')
    setPage(1)
  }

  const handleEdit = (employee) => {
    setForm({
      name: employee.name,
      email: employee.email,
      company: employee.company,
      city: employee.city,
      department: employee.department,
      status: employee.status,
    })

    setEditingId(employee.id)
    setShowForm(true)
    setMessage('')
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this employee?'
    )

    if (!confirmed) return

    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== id)
    )

    showMessage('Employee deleted successfully.')
  }

  const filteredEmployees = employees.filter((employee) => {
    const details = [
      employee.name,
      employee.email,
      employee.company,
      employee.city,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = details.includes(search.toLowerCase())

    const matchesDepartment =
      departmentFilter === 'All' ||
      employee.department === departmentFilter

    const matchesStatus =
      statusFilter === 'All' || employee.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  )

  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize

  const visibleEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + pageSize
  )

  const activeCount = employees.filter(
    (employee) => employee.status === 'Active'
  ).length

  const departmentCount = new Set(
    employees.map((employee) => employee.department)
  ).size

  const changePage = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">W</div>
          <h2>WorkSpace</h2>
        </div>

        <p className="nav-label">MAIN MENU</p>
        <div className="nav-item active">▦ <span>Dashboard</span></div>
        <div className="nav-item">♙ <span>Employees</span></div>
        <div className="nav-item">▤ <span>Departments</span></div>
        <div className="nav-item">⚙ <span>Settings</span></div>

        <div className="sidebar-bottom">
          <div className="sidebar-avatar">A</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>Employee Dashboard</h1>
            <p className="subtitle">
              Manage your team and employee information.
            </p>
          </div>

          <button className="primary-button" onClick={openAddForm}>
            + Add Employee
          </button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Employees</span>
              <span className="stat-icon purple">♙</span>
            </div>
            <h2>{employees.length}</h2>
            <p className="stat-note">Employees in the directory</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Active Employees</span>
              <span className="stat-icon green">✓</span>
            </div>
            <h2>{activeCount}</h2>
            <p className="stat-note">Currently marked active</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Departments</span>
              <span className="stat-icon blue">▤</span>
            </div>
            <h2>{departmentCount}</h2>
            <p className="stat-note">Departments represented</p>
          </div>
        </section>

        {message && (
          <div className="success-message">✓ &nbsp; {message}</div>
        )}

        {showForm && (
          <section className="employee-section form-section">
            <div className="section-heading">
              <div>
                <h2>
                  {editingId !== null ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <p>Fill in the employee details.</p>
              </div>

              <button className="close-button" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form className="employee-form" onSubmit={handleSubmit}>
              <label>
                Full Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label>
                Company
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label>
                Department
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId !== null ? 'Update Employee' : 'Save Employee'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="employee-section">
          <div className="table-heading">
            <div>
              <h2>All Employees</h2>
              <p>Browse and manage your employee directory.</p>
            </div>

            <span className="result-count">
              {filteredEmployees.length} employees
            </span>
          </div>

          <div className="filters">
            <input
              className="search-input"
              type="search"
              placeholder="Search name, email, company or city..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />

            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value)
                setPage(1)
              }}
              aria-label="Filter by department"
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="state-message">Loading employees...</p>}

          {error && (
            <div className="state-message error-message">
              <p>{error}</p>
              <button
                className="secondary-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="table-container">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>ID</th>
                      <th>Company</th>
                      <th>Department</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <div className="employee-profile">
                            <img
                              className="employee-avatar"
                              src={employee.image}
                              alt={employee.name}
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src =
                                  'https://ui-avatars.com/api/?name=Employee&background=e5e7eb&color=374151'
                              }}
                            />

                            <div className="employee-details">
                              <strong>{employee.name}</strong>
                              <span>{employee.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="id-cell">#{employee.id}</td>
                        <td>{employee.company}</td>

                        <td>
                          <span className="department-badge">
                            {employee.department}
                          </span>
                        </td>

                        <td>{employee.city}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              employee.status === 'Active'
                                ? 'status-active'
                                : 'status-inactive'
                            }`}
                          >
                            <span className="status-dot" />
                            {employee.status}
                          </span>
                        </td>

                        <td>
                          <div className="employee-actions">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(employee)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => handleDelete(employee.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredEmployees.length === 0 && (
                  <div className="empty-state">
                    <h3>No employees found</h3>
                    <p>Try changing your search or filters.</p>
                  </div>
                )}
              </div>

              <div className="pagination">
                <span>
                  Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1}
                  –{Math.min(startIndex + pageSize, filteredEmployees.length)}
                  {' '}of {filteredEmployees.length}
                </span>

                <div className="pagination-buttons">
                  <button
                    className="page-button"
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (
                    <button
                      key={number}
                      className={`page-number ${
                        currentPage === number ? 'selected' : ''
                      }`}
                      onClick={() => changePage(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    className="page-button"
                    disabled={currentPage === totalPages}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="dashboard-footer">
          Employee Management System <span>•</span> Demo project
        </footer>
      </main>
    </div>
  )
}

export default App