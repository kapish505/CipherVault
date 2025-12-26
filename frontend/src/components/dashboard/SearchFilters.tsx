/**
 * Advanced Search Component
 * 
 * Search with filters for file type, date, size
 */

import { useState } from 'react';
import './SearchFilters.css';

export interface SearchFilters {
    query: string;
    fileType: string;
    dateRange: string;
    sizeRange: string;
    sortBy: string;
}

interface SearchFiltersProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchFiltersComponent({ filters, onFiltersChange }: SearchFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (key: keyof SearchFilters, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="search-filters">
            <div className="search-main">
                <input
                    type="text"
                    className="search-input-main"
                    placeholder="Search files..."
                    value={filters.query}
                    onChange={(e) => handleChange('query', e.target.value)}
                />
                <button
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? '▲' : '▼'} Filters
                </button>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>File Type</label>
                        <select
                            value={filters.fileType}
                            onChange={(e) => handleChange('fileType', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="audio">Audio</option>
                            <option value="application">Documents</option>
                            <option value="text">Text</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Date</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleChange('dateRange', e.target.value)}
                        >
                            <option value="">Any Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Size</label>
                        <select
                            value={filters.sizeRange}
                            onChange={(e) => handleChange('sizeRange', e.target.value)}
                        >
                            <option value="">Any Size</option>
                            <option value="small">&lt; 1 MB</option>
                            <option value="medium">1-10 MB</option>
                            <option value="large">10-100 MB</option>
                            <option value="xlarge">&gt; 100 MB</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleChange('sortBy', e.target.value)}
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="size-desc">Largest First</option>
                            <option value="size-asc">Smallest First</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
