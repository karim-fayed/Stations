import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useLanguage } from '@/i18n/LanguageContext';

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-2" role="radiogroup" aria-label="Star rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl transition-transform duration-200 transform hover:scale-110 focus:outline-none ${
          star <= value ? 'text-orange-500' : 'text-gray-300'
        }`}
        aria-checked={star <= value}
        role="radio"
      >
        ★
      </button>
    ))}
  </div>
);

const FeedbackForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [qualityRating, setQualityRating] = useState(5);
  const [appRating, setAppRating] = useState(5);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useUserLocation();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const feedbackData: any = {
      customer_name: customerName,
      quality_rating: qualityRating,
      app_rating: appRating,
      suggestion,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    const { error } = await supabase.from('feedback').insert([feedbackData]);
    setLoading(false);

    if (error) {
      setError(
        language === 'ar'
          ? 'حدث خطأ أثناء إرسال التقييم. حاول مرة أخرى.'
          : 'An error occurred while submitting your feedback. Please try again.'
      );
    } else {
      setSuccess(true);
      setCustomerName('');
      setQualityRating(5);
      setAppRating(5);
      setSuggestion('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg transform transition-all duration-300"
      >
        <h3 className="text-2xl font-bold mb-6 text-purple-700 text-center animate-fadeIn">
          {language === 'ar' ? 'شاركنا رأيك في الخدمة والبرنامج' : 'Share Your Feedback'}
        </h3>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            {language === 'ar' ? 'اسم العميل' : 'Customer Name'}
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 animate-slide-in"
            placeholder={language === 'ar' ? 'اكتب اسمك' : 'Enter your name'}
            aria-required="true"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            {language === 'ar' ? 'تقييم الجودة' : 'Service Quality Rating'}
          </label>
          <StarRating value={qualityRating} onChange={setQualityRating} />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            {language === 'ar' ? 'تقييم البرنامج' : 'App Rating'}
          </label>
          <StarRating value={appRating} onChange={setAppRating} />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-700">
            {language === 'ar' ? 'اقتراح (اختياري)' : 'Suggestion (Optional)'}
          </label>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            rows={4}
            placeholder={language === 'ar' ? 'اكتب اقتراحك إن وجد' : 'Write your suggestion if any'}
          />
        </div>

        {loading && (
          <div className="text-center text-gray-700 mb-4 animate-fadeIn">
            {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 animate-fadeIn">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 animate-fadeIn">
            {language === 'ar'
              ? 'تم إرسال التقييم بنجاح. شكرًا لملاحظاتك!'
              : 'Feedback submitted successfully. Thank you!'}
          </div>
        )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-noor-purple to-noor-orange hover:opacity-90'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
              </>
            ) : (
              language === 'ar' ? 'إرسال التقييم' : 'Submit Feedback'
            )}
          </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
