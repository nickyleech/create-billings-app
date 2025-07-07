import React, { useState } from 'react';
import { X, Monitor, Tag, Folder } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    brandGuidelines: '',
    organizationType: 'none',
    organizationValue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Popular UK TV channels and programme genres
  const channels = [
    'BBC One', 'BBC Two', 'BBC Three', 'BBC Four', 'BBC News', 'BBC Parliament',
    'ITV', 'ITV2', 'ITV3', 'ITV4', 'ITVBe', 'CITV',
    'Channel 4', 'E4', 'More4', 'Film4', '4Music',
    'Channel 5', '5STAR', '5USA', '5SELECT',
    'Sky One', 'Sky Atlantic', 'Sky Sports', 'Sky News', 'Sky Arts',
    'UKTV', 'Dave', 'Yesterday', 'Drama', 'Really',
    'Discovery', 'National Geographic', 'History', 'Animal Planet'
  ];

  const genres = [
    'Documentary', 'Drama', 'Comedy', 'Sitcom', 'Soap Opera',
    'Reality TV', 'Game Show', 'Talk Show', 'News', 'Sport',
    'Children\'s', 'Animation', 'Crime', 'Thriller', 'Science Fiction',
    'Fantasy', 'Horror', 'Romance', 'Action', 'Adventure',
    'Music', 'Arts & Culture', 'Lifestyle', 'Food', 'Travel',
    'Nature', 'Science', 'History', 'Biography', 'Educational'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear organization value when type changes
    if (name === 'organizationType') {
      setFormData(prev => ({
        ...prev,
        organizationValue: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCreateProject(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        clientName: '',
        brandGuidelines: '',
        organizationType: 'none',
        organizationValue: ''
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrganizationOptions = () => {
    if (formData.organizationType === 'channel') {
      return (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Channel
          </label>
          <select
            name="organizationValue"
            value={formData.organizationValue}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a channel...</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
      );
    }

    if (formData.organizationType === 'genre') {
      return (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Programme Genre
          </label>
          <select
            name="organizationValue"
            value={formData.organizationValue}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a genre...</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BBC One Drama Billings"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description of the project..."
              />
            </div>

            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client/Channel Name
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BBC, ITV, Channel 4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Project Organization
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="organizationType"
                    value="none"
                    checked={formData.organizationType === 'none'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <Folder className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">No Organization</div>
                    <div className="text-sm text-gray-600">General project without specific categorization</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="organizationType"
                    value="channel"
                    checked={formData.organizationType === 'channel'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <Monitor className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">Organize by Channel</div>
                    <div className="text-sm text-gray-600">Group by TV channel (BBC One, ITV, etc.)</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="organizationType"
                    value="genre"
                    checked={formData.organizationType === 'genre'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <Tag className="w-5 h-5 mr-3 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900">Organize by Programme Genre</div>
                    <div className="text-sm text-gray-600">Group by content type (Drama, Documentary, etc.)</div>
                  </div>
                </label>
              </div>

              {renderOrganizationOptions()}
            </div>

            <div>
              <label htmlFor="brandGuidelines" className="block text-sm font-medium text-gray-700 mb-1">
                Brand Guidelines
              </label>
              <textarea
                id="brandGuidelines"
                name="brandGuidelines"
                value={formData.brandGuidelines}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any specific style guidelines, tone of voice, or brand requirements..."
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;