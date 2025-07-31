import React, { useState, useMemo, useEffect } from 'react';
import { X, User, Phone, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Client, CallType, BookingFormData } from '../types';
import { formatDate, formatTime, getCallDuration } from '../utils/dateUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  selectedDate: Date;
  selectedTime: string;
  clients: Client[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  selectedTime,
  clients,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCallType, setSelectedCallType] = useState<CallType>('onboarding');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || !selectedClientId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        clientId: selectedClientId,
        callType: selectedCallType,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      });
      
      // Reset form after successful submission
      handleReset();
    } catch (error) {
      // Silent error handling for production
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedClientId('');
    setSelectedCallType('onboarding');
    setSearchTerm('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 lg:p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md lg:max-w-2xl w-full max-h-[95vh] flex flex-col animate-fade-in-up transition-colors duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                  Book New Call
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">
                  Schedule a professional client consultation
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            {/* Date and Time Display */}
            <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Date</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/40">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Time</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatTime(selectedTime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Type Selection */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <label className="block text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Call Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="callType"
                    value="onboarding"
                    checked={selectedCallType === 'onboarding'}
                    onChange={(e) => setSelectedCallType(e.target.value as CallType)}
                    className="sr-only"
                  />
                  <div className={`p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedCallType === 'onboarding'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 ${
                        selectedCallType === 'onboarding'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {selectedCallType === 'onboarding' && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Onboarding Call</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">40 minutes • Initial consultation</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="callType"
                    value="followup"
                    checked={selectedCallType === 'followup'}
                    onChange={(e) => setSelectedCallType(e.target.value as CallType)}
                    className="sr-only"
                  />
                  <div className={`p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedCallType === 'followup'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 ${
                        selectedCallType === 'followup'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {selectedCallType === 'followup' && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Follow-up Call</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">20 minutes • Progress check</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Client Selection */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <label className="block text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Select Client
              </label>
              
              {/* Search Input */}
              <div className="relative mb-3 sm:mb-4">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 text-sm"
                />
              </div>

              {/* Client List */}
              <div className="max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800">
                {filteredClients.length === 0 ? (
                  <div className="p-4 sm:p-6 lg:p-8 text-center">
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No clients found</p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <label key={client.id} className="block">
                      <input
                        type="radio"
                        name="clientId"
                        value={client.id}
                        checked={selectedClientId === client.id}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-2 sm:p-3 lg:p-4 cursor-pointer transition-all duration-200 ${
                        selectedClientId === client.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{client.name}</h4>
                            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{client.phone}</span>
                            </div>
                          </div>
                          {selectedClientId === client.id && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 lg:p-8 pt-2 sm:pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedClientId}
              className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <span>Book Call ({getCallDuration(selectedCallType)} min)</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;