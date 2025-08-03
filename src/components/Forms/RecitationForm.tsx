import React, { useState, useEffect } from "react";
import { Recitation, Lesson, Student } from "../../types";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { MultiSelect } from "../UI/MultiSelect";
import { QURAN_PARTS } from "../../constants";
import { useTranslation } from 'react-i18next';

interface RecitationFormProps {
  recitation?: Recitation | null;
  courseStudents?: Student[];
  courseLessons?: Lesson[];
  selectedCourse?: number | null;
  selectedCourseName?: string;
  selectedStudent?: Student; // ✅ تم إضافته
  onSave: (data: any) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const RecitationForm: React.FC<RecitationFormProps> = ({
  recitation,
  courseStudents = [],
  courseLessons = [],
  selectedCourse,
  selectedCourseName = "",
  selectedStudent, // ✅ تم استلامه
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    lesson_id: 0,
    students: [] as number[],
    student_id: 0,
    recitation_per_page: [] as number[],
    recitation_evaluation: "",
    current_juz: "",
    current_juz_page: 1,
    recitation_notes: "",
    homework: [] as number[],
  });

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (recitation) {
      setFormData({
        lesson_id: recitation.lesson_id || 0,
        students: [],
        student_id: recitation.student_id || 0,
        recitation_per_page: recitation.recitation_per_page || [],
        recitation_evaluation: recitation.recitation_evaluation || "",
        current_juz: recitation.current_juz?.toString() || "",
        current_juz_page: recitation.current_juz_page || 1,
        recitation_notes: recitation.recitation_notes || "",
        homework: recitation.homework || [],
      });
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setFormData({
        lesson_id: 0,
        students: [],
        student_id: 0,
        recitation_per_page: [],
        recitation_evaluation: "",
        current_juz: "",
        current_juz_page: 1,
        recitation_notes: "",
        homework: [],
      });
    }
  }, [recitation]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const lessonOptions = courseLessons.map((lesson) => ({
    value: lesson.id!,
    label: `${lesson.lesson_title} - ${lesson.lesson_date}`,
  }));

  const evaluationOptions = [
    { value: "Excellent", label: t('recitation.excellent') },
    { value: "Good", label: t('recitation.good') },
    { value: "Fair", label: t('recitation.fair') },
    { value: "Poor", label: t('recitation.poor') },
    { value: "So Bad", label: t('recitation.soBad') },
  ];

  const recitationPageOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${t('recitation.page')} ${i + 1}`,
  }));

  const homeworkOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${t('recitation.assignment')} ${i + 1}`,
  }));

  // ... بداية الكود كما هي حتى الـ return ...

return (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="px-8 py-6 border-b border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900">
        {isEditMode ? t('recitation.editRecitationRecord') : t('recitation.addNewRecitation')}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {isEditMode
          ? t('recitation.updateRecitationDetails')
          : t('recitation.fillRecitationDetails')}
      </p>
    </div>

    <form onSubmit={handleSubmit} className="p-8 space-y-8">
      {/* Course Info */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          {t('recitation.courseInformation')}
        </h4>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">📚</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedCourseName}
              </p>
              <p className="text-sm text-gray-600">{t('recitation.tahfeezCourse')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Selection */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          {t('recitation.sessionDetails')}
        </h4>
        <Select
          label={t('recitation.lesson')}
          value={formData.lesson_id}
          onChange={(e) =>
            handleChange("lesson_id", parseInt(e.target.value))
          }
          options={lessonOptions}
          error={validationErrors.lesson_id?.[0]}
          required
        />
      </div>

      {/* باقي الحقول تظهر فقط في وضع التعديل */}
      {isEditMode && (
        <>
          {/* Student Info */}
          {selectedStudent && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {t('recitation.studentInfo')}
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {selectedStudent.student_img && (
                    <img
                      src={selectedStudent.student_img}
                      alt={selectedStudent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedStudent.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('recitation.studentId')}: {selectedStudent.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recitation Progress */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              {t('recitation.recitationProgress')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('recitation.currentJuzPage')}
                type="number"
                min="1"
                max="20"
                value={formData.current_juz_page}
                onChange={(e) =>
                  handleChange("current_juz_page", parseInt(e.target.value) || 1)
                }
                error={validationErrors.current_juz_page?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label={t('recitation.quranMemorizedParts')}
                options={QURAN_PARTS}
                value={formData.current_juz}
                onChange={(e) => handleChange("current_juz", e.target.value)}
                error={validationErrors.current_juz?.[0]}
              />

              <MultiSelect
                label={t('recitation.recitationPerPage')}
                options={recitationPageOptions}
                value={formData.recitation_per_page.map((p) => p.toString())}
                onChange={(selected) => {
                  const pages = selected.map((p) => parseInt(p));
                  handleChange("recitation_per_page", pages);
                }}
                error={validationErrors.recitation_per_page?.[0]}
              />
              <MultiSelect
                label={t('recitation.homework')}
                options={homeworkOptions}
                value={formData.homework.map((h) => h.toString())}
                onChange={(selected) => {
                  const homework = selected.map((h) => parseInt(h));
                  handleChange("homework", homework);
                }}
                error={validationErrors.homework?.[0]}
              />
            </div>
          </div>

          {/* Evaluation & Notes */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              {t('recitation.evaluationNotes')}
            </h4>
            <Select
              label={t('recitation.evaluation')}
              value={formData.recitation_evaluation}
              onChange={(e) =>
                handleChange("recitation_evaluation", e.target.value)
              }
              options={evaluationOptions}
              error={validationErrors.recitation_evaluation?.[0]}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('recitation.recitationNotes')}
              </label>
              <textarea
                value={formData.recitation_notes}
                onChange={(e) =>
                  handleChange("recitation_notes", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0e4d3c] focus:border-transparent transition-all duration-200 resize-none"
                placeholder={t('recitation.addNotesPlaceholder')}
              />
              {validationErrors.recitation_notes && (
                <p className="text-red-600 text-sm mt-1">
                  {validationErrors.recitation_notes[0]}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          size="lg"
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading} size="lg">
          {isEditMode ? t('recitation.updateRecitation') : t('recitation.createRecitation')}
        </Button>
      </div>
    </form>
  </div>
);

};
