"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2 } from "lucide-react"

const MOCK_PATIENTS = [
  {
    id: "1",
    name: "John Doe",
    age: 45,
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    medical_conditions: ["Diabetes Type 2"],
  },
  {
    id: "2",
    name: "Jane Smith",
    age: 52,
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    medical_conditions: ["Hypertension", "High Cholesterol"],
  },
]

export default function PatientManagement() {
  const [patients, setPatients] = useState<any[]>(MOCK_PATIENTS)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    medical_conditions: [] as string[],
  })

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      setPatients(
        patients.map((p) => (p.id === editingId ? { ...p, ...formData, age: Number.parseInt(formData.age) } : p)),
      )
      setEditingId(null)
    } else {
      const newPatient = {
        id: Date.now().toString(),
        ...formData,
        age: Number.parseInt(formData.age),
      }
      setPatients([...patients, newPatient])
    }

    setFormData({ name: "", age: "", email: "", phone: "", medical_conditions: [] })
    setShowForm(false)
  }

  const handleEditPatient = (patient: any) => {
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      email: patient.email || "",
      phone: patient.phone || "",
      medical_conditions: patient.medical_conditions || [],
    })
    setEditingId(patient.id)
    setShowForm(true)
  }

  const handleDeletePatient = (id: string) => {
    if (!confirm("Are you sure? This will delete the patient and all associated data.")) return
    setPatients(patients.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: "", age: "", email: "", phone: "", medical_conditions: [] })
          }}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus size={20} />
          Add Patient
        </Button>
      </div>

      {/* Add/Edit Patient Form */}
      {showForm && (
        <Card className="p-6 bg-green-50 border-green-200">
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="45"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingId ? "Update Patient" : "Add Patient"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Patients List */}
      <div className="grid gap-4">
        {patients.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No patients added yet</Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">Age: {patient.age}</p>
                  {patient.email && <p className="text-sm text-gray-600">{patient.email}</p>}
                  {patient.phone && <p className="text-sm text-gray-600">{patient.phone}</p>}
                  {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                    <p className="text-sm text-blue-600">Conditions: {patient.medical_conditions.join(", ")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditPatient(patient)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeletePatient(patient.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
