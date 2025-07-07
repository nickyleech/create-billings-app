import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Folder, Plus, Calendar, FileText, MoreVertical, Edit, Trash2, Settings, Monitor, Tag, Filter } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://create-billings.vercel.app' 
  : 'http://localhost:3001';

const ProjectList = ({ onSelectProject, onCreateProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'channel', 'genre', 'none'
  const [filterValue, setFilterValue] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects?action=list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects?action=delete&id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== projectId));
      setShowDropdown(null);
    } catch (error) {
      alert('Error deleting project: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredProjects = () => {
    if (filterType === 'all') {
      return projects;
    }
    
    return projects.filter(project => {
      if (filterType === 'channel') {
        return project.organization_type === 'channel' && 
               (!filterValue || project.organization_value === filterValue);
      }
      if (filterType === 'genre') {
        return project.organization_type === 'genre' && 
               (!filterValue || project.organization_value === filterValue);
      }
      if (filterType === 'none') {
        return project.organization_type === 'none' || !project.organization_type;
      }
      return true;
    });
  };

  const getUniqueChannels = () => {
    return [...new Set(projects
      .filter(p => p.organization_type === 'channel' && p.organization_value)
      .map(p => p.organization_value)
    )].sort();
  };

  const getUniqueGenres = () => {
    return [...new Set(projects
      .filter(p => p.organization_type === 'genre' && p.organization_value)
      .map(p => p.organization_value)
    )].sort();
  };

  const getOrganizationIcon = (organizationType) => {
    switch (organizationType) {
      case 'channel':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'genre':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return <Folder className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchProjects}
          className="mt-2 text-red-700 hover:text-red-900 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-900">Projects</h2>
        <button
          onClick={onCreateProject}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Controls */}
      {projects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              <option value="channel">By Channel</option>
              <option value="genre">By Genre</option>
              <option value="none">Unorganized</option>
            </select>

            {filterType === 'channel' && getUniqueChannels().length > 0 && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Channels</option>
                {getUniqueChannels().map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            )}

            {filterType === 'genre' && getUniqueGenres().length > 0 && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                {getUniqueGenres().map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            )}

            <div className="text-sm text-gray-500">
              {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Create your first project to organize your copy variations</p>
          <button
            onClick={onCreateProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects match your filter</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filter settings or create a new project</p>
          <button
            onClick={() => {
              setFilterType('all');
              setFilterValue('');
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mr-2"
          >
            Clear Filters
          </button>
          <button
            onClick={onCreateProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  {getOrganizationIcon(project.organization_type)}
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === project.id ? null : project.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showDropdown === project.id && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit project
                          setShowDropdown(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {project.organization_type !== 'none' && project.organization_value && (
                <div className="flex items-center space-x-1 mb-2">
                  {project.organization_type === 'channel' && <Monitor className="w-3 h-3 text-blue-500" />}
                  {project.organization_type === 'genre' && <Tag className="w-3 h-3 text-purple-500" />}
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {project.organization_value}
                  </span>
                </div>
              )}

              {project.client_name && (
                <p className="text-sm text-gray-600 mb-2">Client: {project.client_name}</p>
              )}

              {project.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{project.copy_count || 0} entries</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};

export default ProjectList;