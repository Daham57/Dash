import React, { useState, useEffect } from 'react';
import { Exam, Course } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useTranslation } from 'react-i18next';

interface ExamFormProps {
  initialData?: Exam | null;
  onSave: (data: Exam) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  initialData,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Exam>({
    title: '',
    exam_date: '',
    max_mark: 0,
    passing_mark: 0,
    course_id: 0,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchCourses();
  }, [initialData]);

  const fetchCourses = async () => {
    try {
      const response = await apiService.getAll('courses');
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleChange = (field: keyof Exam, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id!,
    label: course.title,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t('exams.examTitle')}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={validationErrors.title?.[0]}
          required
        />

        <Input
          label={t('exams.examDate')}
          type="date"
          value={formData.exam_date}
          onChange={(e) => handleChange('exam_date', e.target.value)}
          error={validationErrors.exam_date?.[0]}
          required
        />

        <Input
          label={t('exams.maximumMark')}
          type="number"
          value={formData.max_mark}
          onChange={(e) => handleChange('max_mark', parseInt(e.target.value))}
          error={validationErrors.max_mark?.[0]}
          required
        />

        <Input
          label={t('exams.passingMark')}
          type="number"
          value={formData.passing_mark}
          onChange={(e) => handleChange('passing_mark', parseInt(e.target.value))}
          error={validationErrors.passing_mark?.[0]}
          required
        />
      </div>

      <Select
        label={t('exams.course')}
        value={formData.course_id}
        onChange={(e) => handleChange('course_id', parseInt(e.target.value))}
        options={courseOptions}
        error={validationErrors.course_id?.[0]}
        required
      />

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? t('exams.updateExam') : t('exams.createExam')}
        </Button>
      </div>
    </form>
  );
};
