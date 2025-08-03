import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Attendance, Lesson, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Select } from '../UI/Select';
import { Input } from '../UI/Input';
import QrReader from 'react-qr-reader';

interface AttendanceFormProps {
  initialData?: Attendance | null;
  onSave: (data: Attendance) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ initialData, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Attendance>({
    lesson_id: 0,
    student_id: 0,
    student_attendance: null,
    student_attendance_time: null,
  });

  const [qrInput, setQrInput] = useState(''); // لإدخال رقم QR يدوي
  const [showScanner, setShowScanner] = useState(false); // عرض الماسح

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchLessonsAndStudents();
  }, [initialData]);

  const fetchLessonsAndStudents = async () => {
    try {
      const [lessonsResponse, studentsResponse] = await Promise.all([
        apiService.getAll('lessons'),
        apiService.getAll('students'),
      ]);
      setLessons(lessonsResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch lessons and students:', error);
    }
  };

  const handleChange = (field: keyof Attendance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQRData = (data: string | null) => {
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (parsed.student_id && parsed.lesson_id) {
        setFormData({
          student_id: parsed.student_id,
          lesson_id: parsed.lesson_id,
          student_attendance: 1,
          student_attendance_time: new Date().toISOString(),
        });
        setShowScanner(false);
      }
    } catch (e) {
      alert(t('attendance.invalidQrFormat'));
    }
  };

  const handleManualQR = () => {
    const student = students.find((s) => s.id === parseInt(qrInput));
    if (!student) {
      alert(t('attendance.studentNotFound'));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      student_id: student.id,
      student_attendance: 1,
      student_attendance_time: new Date().toISOString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        student_attendance_time:
          formData.student_attendance === 1 ? new Date().toISOString() : null,
      };
      await onSave(dataToSave);
    } finally {
      setLoading(false);
    }
  };

  const lessonOptions = lessons.map((lesson) => ({
    value: lesson.id!,
    label: lesson.lesson_title,
  }));

  const studentOptions = students.map((student) => ({
    value: student.id!,
    label: student.name,
  }));

  const attendanceOptions = [
    { value: 1, label: t('attendance.present') },
    { value: 0, label: t('attendance.absent') },
        <h1 className="text-3xl font-bold text-[#0e4d3c] mb-2">{t('attendance.attendanceForm')}</h1>
        <p className="text-gray-600">{t('attendance.fillAttendanceDetails')}</p>
  ]
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* QR SECTION */}
      <div className="space-y-3 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700">{t('attendance.qrAttendanceOptions')}</h3>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Input
            label={t('attendance.enterQrManually')}
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder={t('attendance.qrPlaceholder')}
          />
          <Button type="button" onClick={handleManualQR}>
            {t('attendance.useQrNumber')}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowScanner((prev) => !prev)}
        >
          {showScanner ? t('attendance.hideScanner') : t('attendance.scanQrCode')}
        </Button>

        {showScanner && (
          <div className="mt-4 border border-gray-300 rounded overflow-hidden">
            <QrReader
              delay={300}
              onError={(err) => console.error(err)}
              onScan={handleQRData}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* MANUAL FORM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label={t('attendance.lesson')}
          value={formData.lesson_id}
          onChange={(e) => handleChange('lesson_id', parseInt(e.target.value))}
          options={lessonOptions}
          required
        />

        <Select
          label={t('attendance.student')}
          value={formData.student_id}
          onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
          options={studentOptions}
          required
        />
      </div>

      <Select
        label={t('attendance.attendanceStatus')}
        value={formData.student_attendance ?? ''}
        onChange={(e) =>
          handleChange(
            'student_attendance',
            e.target.value === '' ? null : parseInt(e.target.value)
          )
        }
        options={attendanceOptions}
      />

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? t('attendance.updateAttendance') : t('attendance.createAttendance')}
        </Button>
      </div>
    </form>
  );
};
