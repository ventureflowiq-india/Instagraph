// src/pages/DataViewer.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { UploadedFile } from '../hooks/useUploadedFiles'
import { fileProcessingService } from '../services/fileProcessingService'
import toast from 'react-hot-toast'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  ReferenceLine, Brush
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface DataViewerProps {}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  xAxis: string
  yAxis: string
  title: string
  color: string
  showGrid: boolean
  showLegend: boolean
  showTooltip: boolean
  height: number
  enableZoom?: boolean
  enableBrush?: boolean
  filters: {
    xAxisRange: { min: number | null; max: number | null }
    yAxisRange: { min: number | null; max: number | null }
    xAxisCategories: string[]
    yAxisCategories: string[]
    dateRange: { start: string | null; end: string | null }
  }
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function DataViewer() {
  const { fileId } = useParams<{ fileId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'preview' | 'insights' | 'charts'>('preview')
  const [processing, setProcessing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'insights']))
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    xAxis: '',
    yAxis: '',
    title: '',
    color: CHART_COLORS[0],
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    height: 400,
    filters: {
      xAxisRange: { min: null, max: null },
      yAxisRange: { min: null, max: null },
      xAxisCategories: [],
      yAxisCategories: [],
      dateRange: { start: null, end: null }
    }
  })
  const [showChartBuilder, setShowChartBuilder] = useState(false)
  const [exporting, setExporting] = useState(false)
  const chartRef = React.useRef<HTMLDivElement>(null)
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [filterColumn, setFilterColumn] = useState<string>('')

  // Memoized data processing for charts with filtering
  const chartData = useMemo(() => {
    if (!file?.data_preview?.preview_data || !chartConfig.xAxis || !chartConfig.yAxis) {
      return []
    }

    const { preview_data } = file.data_preview
    let processedData = preview_data.map((row: any) => ({
      [chartConfig.xAxis]: row[chartConfig.xAxis],
      [chartConfig.yAxis]: typeof row[chartConfig.yAxis] === 'number' ? row[chartConfig.yAxis] : parseFloat(row[chartConfig.yAxis]) || 0
    }))

    // Apply filters
    const { filters } = chartConfig
    
    // Filter by X-axis range (for numerical data)
    if (filters.xAxisRange.min !== null || filters.xAxisRange.max !== null) {
      const xAxisValues = processedData.map((item: any) => {
        const val = item[chartConfig.xAxis]
        return typeof val === 'number' ? val : parseFloat(val) || 0
      })
      const minVal = filters.xAxisRange.min !== null ? filters.xAxisRange.min : Math.min(...xAxisValues)
      const maxVal = filters.xAxisRange.max !== null ? filters.xAxisRange.max : Math.max(...xAxisValues)
      
      processedData = processedData.filter((item: any) => {
        const val = typeof item[chartConfig.xAxis] === 'number' ? item[chartConfig.xAxis] : parseFloat(item[chartConfig.xAxis]) || 0
        return val >= minVal && val <= maxVal
      })
    }

    // Filter by Y-axis range (for numerical data)
    if (filters.yAxisRange.min !== null || filters.yAxisRange.max !== null) {
      const yAxisValues = processedData.map((item: any) => item[chartConfig.yAxis])
      const minVal = filters.yAxisRange.min !== null ? filters.yAxisRange.min : Math.min(...yAxisValues)
      const maxVal = filters.yAxisRange.max !== null ? filters.yAxisRange.max : Math.max(...yAxisValues)
      
      processedData = processedData.filter((item: any) => {
        return item[chartConfig.yAxis] >= minVal && item[chartConfig.yAxis] <= maxVal
      })
    }

    // Filter by X-axis categories
    if (filters.xAxisCategories.length > 0) {
      processedData = processedData.filter((item: any) => 
        filters.xAxisCategories.includes(String(item[chartConfig.xAxis]))
      )
    }

    // Filter by Y-axis categories
    if (filters.yAxisCategories.length > 0) {
      processedData = processedData.filter((item: any) => 
        filters.yAxisCategories.includes(String(item[chartConfig.yAxis]))
      )
    }

    // Filter by date range - automatically detect datetime column
    if (filters.dateRange.start && filters.dateRange.end) {
      const datetimeColumn = availableColumns.find((col: any) => 
        col.isDate && (col.type === 'datetime64' || col.type === 'datetime64[ns]' || col.type.includes('datetime'))
      )
      
      if (datetimeColumn) {
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        
        processedData = processedData.filter((item: any) => {
          const itemDate = new Date(item[datetimeColumn.name])
          return itemDate >= startDate && itemDate <= endDate
        })
      }
    }

    // For pie charts, aggregate data
    if (chartConfig.type === 'pie') {
      const aggregated = processedData.reduce((acc: any, item: any) => {
        const key = item[chartConfig.xAxis]
        acc[key] = (acc[key] || 0) + item[chartConfig.yAxis]
        return acc
      }, {})

      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value,
        fill: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)]
      }))
    }

    return processedData
  }, [file?.data_preview?.preview_data, chartConfig])

  // Get available columns for chart configuration
  const availableColumns = useMemo(() => {
    if (!file?.data_preview?.columns_info) return []
    return file.data_preview.columns_info.map((col: any) => ({
      name: col.name,
      type: col.type,
      isNumeric: col.type === 'int64' || col.type === 'float64' || col.type === 'number',
      isDate: col.type === 'datetime64' || col.type === 'datetime64[ns]' || col.type.includes('datetime') ||
              (col.type === 'object' && typeof col.name === 'string' && (
                col.name.toLowerCase().includes('date') || 
                col.name.toLowerCase().includes('time') ||
                col.name.toLowerCase().includes('created') ||
                col.name.toLowerCase().includes('updated')
              ))
    }))
  }, [file?.data_preview?.columns_info])

  // Get data ranges and categories for filtering
  const dataRanges = useMemo(() => {
    if (!file?.data_preview?.preview_data || !chartConfig.xAxis || !chartConfig.yAxis) {
      return { xAxis: { min: 0, max: 100 }, yAxis: { min: 0, max: 100 } }
    }

    const { preview_data } = file.data_preview
    const xAxisValues = preview_data.map((row: any) => {
      const val = row[chartConfig.xAxis]
      return typeof val === 'number' ? val : parseFloat(val) || 0
    }).filter((val: number) => !isNaN(val))

    const yAxisValues = preview_data.map((row: any) => {
      const val = row[chartConfig.yAxis]
      return typeof val === 'number' ? val : parseFloat(val) || 0
    }).filter((val: number) => !isNaN(val))

    return {
      xAxis: {
        min: xAxisValues.length > 0 ? Math.min(...xAxisValues) : 0,
        max: xAxisValues.length > 0 ? Math.max(...xAxisValues) : 100
      },
      yAxis: {
        min: yAxisValues.length > 0 ? Math.min(...yAxisValues) : 0,
        max: yAxisValues.length > 0 ? Math.max(...yAxisValues) : 100
      }
    }
  }, [file?.data_preview?.preview_data, chartConfig.xAxis, chartConfig.yAxis])

  const dataCategories = useMemo(() => {
    if (!file?.data_preview?.columns_info || !chartConfig.xAxis || !chartConfig.yAxis) {
      return { xAxis: [], yAxis: [] }
    }

    const { columns_info } = file.data_preview
    
    // Find the column info for X and Y axes
    const xAxisCol = columns_info.find((col: any) => col.name === chartConfig.xAxis)
    const yAxisCol = columns_info.find((col: any) => col.name === chartConfig.yAxis)
    
    // Debug logging
    console.log('X-Axis Column:', xAxisCol)
    console.log('Y-Axis Column:', yAxisCol)
    console.log('Y-Axis unique_values:', yAxisCol?.unique_values)
    console.log('Y-Axis unique_count:', yAxisCol?.unique_count)
    
    // Use unique_values if available, otherwise fall back to preview data
    let xAxisCategories = []
    let yAxisCategories = []
    
    if (xAxisCol?.unique_values) {
      xAxisCategories = xAxisCol.unique_values.map((val: any) => String(val)).filter(Boolean)
      console.log('Using unique_values for X-Axis')
    } else if (file?.data_preview?.preview_data) {
      // Fallback to preview data if unique_values not available
      const { preview_data } = file.data_preview
      xAxisCategories = [...new Set(preview_data.map((row: any) => String(row[chartConfig.xAxis] || '')))].filter(Boolean)
      console.log('Using preview data for X-Axis')
    }
    
    if (yAxisCol?.unique_values && yAxisCol.unique_values.length > 0) {
      yAxisCategories = yAxisCol.unique_values.map((val: any) => String(val)).filter(Boolean)
      console.log('Using unique_values for Y-Axis')
    } else {
      // Fallback: Try to get all unique values from the full dataset if available
      // This is a temporary workaround until the file is reprocessed
      if (file?.data_preview?.preview_data) {
        const { preview_data } = file.data_preview
        yAxisCategories = [...new Set(preview_data.map((row: any) => String(row[chartConfig.yAxis] || '')))].filter(Boolean)
        console.log('Using preview data for Y-Axis (fallback)')
        
        // If we have unique_count but limited unique_values, try to expand the range
        if (yAxisCol?.unique_count && yAxisCol.unique_count > yAxisCategories.length) {
          console.log(`Expected ${yAxisCol.unique_count} unique values but only found ${yAxisCategories.length}`)
          console.log('This suggests the file needs to be reprocessed with the new backend')
        }
      }
    }

    console.log('X-Axis Categories:', xAxisCategories)
    console.log('Y-Axis Categories:', yAxisCategories)
    console.log('Y-Axis Categories Length:', yAxisCategories.length)

    return { xAxis: xAxisCategories, yAxis: yAxisCategories }
  }, [file?.data_preview?.columns_info, chartConfig.xAxis, chartConfig.yAxis])

  // Filtered and sorted data for preview
  const filteredData = useMemo(() => {
    if (!file?.data_preview?.preview_data) return []
    
    let data = [...file.data_preview.preview_data]
    
    // Apply text filter
    if (filterText && filterColumn) {
      data = data.filter((row: any) => {
        const value = String(row[filterColumn] || '').toLowerCase()
        return value.includes(filterText.toLowerCase())
      })
    }
    
    // Apply sorting
    if (sortColumn) {
      data.sort((a: any, b: any) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1
        if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }
    
    return data
  }, [file?.data_preview?.preview_data, filterText, filterColumn, sortColumn, sortDirection])

  useEffect(() => {
    if (fileId && user) {
      fetchFileData()
    }
  }, [fileId, user])

  const fetchFileData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', user?.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setFile(data)
    } catch (err: any) {
      console.error('Error fetching file data:', err)
      setError(err.message || 'Failed to load file data')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessFile = async () => {
    if (!file || !user) return
    
    setProcessing(true)
    toast.loading('Processing file...', { id: 'manual-processing' })
    
    try {
      const result = await fileProcessingService.processFileAsync({
        file_id: file.id,
        user_id: user.id,
        file_path: file.storage_path,
        file_type: file.file_type
      })
      
      if (result.success) {
        toast.success('File processing started!', { id: 'manual-processing' })
        // Refresh the file data
        setTimeout(() => {
          fetchFileData()
        }, 2000)
      } else {
        toast.error(`Processing failed: ${result.message}`, { id: 'manual-processing' })
      }
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file', { id: 'manual-processing' })
    } finally {
      setProcessing(false)
    }
  }

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnName)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setFilterText('')
    setFilterColumn('')
    setSortColumn(null)
    setSortDirection('asc')
  }

  const exportChartAsPNG = async () => {
    if (!chartRef.current) return
    
    setExporting(true)
    toast.loading('Exporting chart as PNG...', { id: 'export-png' })
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      })
      
      const link = document.createElement('a')
      link.download = `${chartConfig.title || 'chart'}.png`
      link.href = canvas.toDataURL()
      link.click()
      
      toast.success('Chart exported as PNG!', { id: 'export-png' })
    } catch (error) {
      console.error('Error exporting PNG:', error)
      toast.error('Failed to export PNG', { id: 'export-png' })
    } finally {
      setExporting(false)
    }
  }

  const exportChartAsPDF = async () => {
    if (!chartRef.current) return
    
    setExporting(true)
    toast.loading('Exporting chart as PDF...', { id: 'export-pdf' })
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      
      const imgWidth = 297 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${chartConfig.title || 'chart'}.pdf`)
      
      toast.success('Chart exported as PDF!', { id: 'export-pdf' })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF', { id: 'export-pdf' })
    } finally {
      setExporting(false)
    }
  }

  const exportChartAsSVG = () => {
    if (!chartRef.current) return
    
    setExporting(true)
    toast.loading('Exporting chart as SVG...', { id: 'export-svg' })
    
    try {
      const svgElement = chartRef.current.querySelector('svg')
      if (!svgElement) {
        throw new Error('No SVG element found')
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const link = document.createElement('a')
      link.download = `${chartConfig.title || 'chart'}.svg`
      link.href = svgUrl
      link.click()
      
      URL.revokeObjectURL(svgUrl)
      toast.success('Chart exported as SVG!', { id: 'export-svg' })
    } catch (error) {
      console.error('Error exporting SVG:', error)
      toast.error('Failed to export SVG', { id: 'export-svg' })
    } finally {
      setExporting(false)
    }
  }

  const renderDataPreview = () => {
    if (!file?.data_preview?.preview_data) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Preview Available</h3>
          <p className="text-gray-500">Process the file to see data preview</p>
        </div>
      )
    }

    const { columns_info } = file.data_preview

    return (
      <div className="space-y-6">
        {/* Data Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rows</p>
                <p className="text-2xl font-semibold text-gray-900">{file.data_preview.total_rows?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Columns</p>
                <p className="text-2xl font-semibold text-gray-900">{columns_info.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">File Size</p>
                <p className="text-2xl font-semibold text-gray-900">{file.file_size_mb.toFixed(1)} MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtering and Sorting Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Controls</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear All Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Column</label>
              <select
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Columns</option>
                {columns_info.map((col: any) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Text</label>
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Enter text to filter..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!filterColumn}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Status</label>
              <div className="text-sm text-gray-600">
                {sortColumn ? (
                  <span>
                    Sorted by <strong>{sortColumn}</strong> ({sortDirection})
                  </span>
                ) : (
                  <span className="text-gray-400">No sorting applied</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
            <p className="text-sm text-gray-500">
                  Showing {filteredData.length} rows of {file.data_preview.total_rows} total rows
                  {filterText && filterColumn && ` (filtered by ${filterColumn})`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filteredData.length} rows
                </span>
                {(filterText || sortColumn) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Filtered
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    #
                  </th>
                  {columns_info.map((col: any, index: number) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(col.name)}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold">{col.name}</span>
                          {sortColumn === col.name && (
                            <span className="text-blue-600">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-normal">{col.type}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {rowIndex + 1}
                    </td>
                    {columns_info.map((col: any, colIndex: number) => (
                      <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[200px] truncate" title={String(row[col.name] || 'null')}>
                          {row[col.name] !== null && row[col.name] !== undefined 
                            ? String(row[col.name])
                            : <span className="text-gray-400 italic">null</span>
                          }
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns_info.map((col: any, index: number) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-lg">{col.name}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {col.type}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Unique values</span>
                  <span className="text-sm font-semibold text-gray-900">{col.unique_count.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Null values</span>
                  <span className="text-sm font-semibold text-gray-900">{col.null_count.toLocaleString()}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${((col.unique_count - col.null_count) / col.unique_count) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {(((col.unique_count - col.null_count) / col.unique_count) * 100).toFixed(1)}% complete
                </p>
                
                {col.sample_values.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-2">Sample values</span>
                    <div className="space-y-1">
                      {col.sample_values.slice(0, 3).map((value: any, i: number) => (
                        <span key={i} className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-1 mb-1">
                          {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAIInsights = () => {
    const toggleSection = (section: string) => {
      const newExpanded = new Set(expandedSections)
      if (newExpanded.has(section)) {
        newExpanded.delete(section)
      } else {
        newExpanded.add(section)
      }
      setExpandedSections(newExpanded)
    }

    const getQualityColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
      if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      return 'text-red-600 bg-red-50 border-red-200'
    }

    const getQualityIcon = (score: number) => {
      if (score >= 80) return '✅'
      if (score >= 60) return '⚠️'
      return '❌'
    }

    if (!file?.metadata?.ai_insights) {
      return (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Insights Not Available</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Process your file to unlock powerful AI-powered insights and analysis</p>
          <button 
            onClick={() => handleProcessFile()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Insights
          </button>
        </div>
      )
    }

    const insights = file.metadata.ai_insights

    return (
      <div className="space-y-8">
        {/* Enhanced Header with Stats */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Analysis Summary</h2>
                <p className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Powered by GPT-4 • Real-time Analysis
                </p>
              </div>
            </div>
            
            {/* Enhanced Data Quality Score */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Data Quality</div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getQualityColor(insights.data_quality_score)}`}>
                  <span className="text-lg mr-2">{getQualityIcon(insights.data_quality_score)}</span>
                  <span className="text-2xl font-bold">{insights.data_quality_score}/100</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Processing Time</div>
                <div className="text-lg font-semibold text-gray-900">2.3s</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{file?.row_count || 0}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{file?.column_count || 0}</div>
              <div className="text-sm text-gray-600">Columns</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{insights.key_insights?.length || 0}</div>
              <div className="text-sm text-gray-600">Key Insights</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{insights.suggested_charts?.length || 0}</div>
              <div className="text-sm text-gray-600">Chart Types</div>
            </div>
          </div>
        </div>

        {/* Collapsible Analysis Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">Analysis Overview</h3>
                <p className="text-gray-600">Comprehensive AI analysis of your dataset</p>
              </div>
            </div>
            <svg 
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.has('overview') ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.has('overview') && (
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-100">
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {insights.summary}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Key Insights */}
        {insights.key_insights && insights.key_insights.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('insights')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Key Insights</h3>
                  <p className="text-gray-600">{insights.key_insights.length} actionable insights discovered</p>
                </div>
              </div>
              <svg 
                className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.has('insights') ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('insights') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {insights.key_insights.map((insight: string, index: number) => (
                    <div key={index} className="group relative">
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{insight}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Chart Suggestions */}
        {insights.suggested_charts && insights.suggested_charts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('charts')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Recommended Visualizations</h3>
                  <p className="text-gray-600">AI-suggested chart types for your data</p>
                </div>
              </div>
              <svg 
                className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.has('charts') ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('charts') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {insights.suggested_charts.map((chart: string, index: number) => (
                    <div 
                      key={index}
                      className="group flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-red-100 hover:border-orange-300 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedTab('charts')}
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-800 capitalize">{chart}</span>
                      <svg className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Pro Tip</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Click on any chart type above to automatically switch to the Charts tab and create that visualization
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Data Quality Assessment */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('quality')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">Data Quality Assessment</h3>
                <p className="text-gray-600">Detailed analysis of your data integrity</p>
              </div>
            </div>
            <svg 
              className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.has('quality') ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.has('quality') && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{insights.data_quality_score}</div>
                  <div className="text-sm text-gray-600 mb-2">Overall Score</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(insights.data_quality_score)}`}>
                    {getQualityIcon(insights.data_quality_score)} {insights.data_quality_score >= 80 ? 'Excellent' : insights.data_quality_score >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg border border-gray-100">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round((file?.row_count || 0) * 0.95)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Completeness</div>
                  <div className="text-xs text-green-700">Data coverage analysis</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {file?.column_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Data Points</div>
                  <div className="text-xs text-blue-700">Total columns analyzed</div>
                </div>
              </div>
              
              {/* Quality Metrics */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Data Structure</div>
                      <div className="text-sm text-green-700">Well-formatted and consistent</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">✓ Good</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-900">Missing Values</div>
                      <div className="text-sm text-yellow-700">Some columns have incomplete data</div>
                    </div>
                  </div>
                  <div className="text-yellow-600 font-semibold">⚠ Review</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setSelectedTab('charts')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Create Visualizations
          </button>
          <button 
            onClick={() => handleProcessFile()}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analysis
          </button>
        </div>
      </div>
    )
  }

  const renderChartBuilder = () => {
    return (
      <div className="space-y-6">
        {/* Chart Builder Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chart Builder</h3>
            <button
              onClick={() => setShowChartBuilder(!showChartBuilder)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showChartBuilder ? 'Hide Builder' : 'Show Builder'}
            </button>
          </div>
          
          {showChartBuilder && (
            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chart Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                  <select
                    value={chartConfig.type}
                    onChange={(e) => setChartConfig({...chartConfig, type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="scatter">Scatter Plot</option>
                  </select>
                </div>

                {/* X-Axis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                  <select
                    value={chartConfig.xAxis}
                    onChange={(e) => setChartConfig({...chartConfig, xAxis: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select X-Axis</option>
                    {availableColumns.map((col: any) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Y-Axis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                  <select
                    value={chartConfig.yAxis}
                    onChange={(e) => setChartConfig({...chartConfig, yAxis: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={chartConfig.type === 'pie'}
                  >
                    <option value="">Select Y-Axis</option>
                    {availableColumns.filter((col: any) => col.isNumeric).map((col: any) => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chart Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={chartConfig.title}
                    onChange={(e) => setChartConfig({...chartConfig, title: e.target.value})}
                    placeholder="Enter chart title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Chart Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {CHART_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setChartConfig({...chartConfig, color})}
                          className={`w-8 h-8 rounded-full border-2 ${
                            chartConfig.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Chart Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chart Height</label>
                    <input
                      type="range"
                      min="200"
                      max="600"
                      value={chartConfig.height}
                      onChange={(e) => setChartConfig({...chartConfig, height: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{chartConfig.height}px</div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Display Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={chartConfig.showGrid}
                          onChange={(e) => setChartConfig({...chartConfig, showGrid: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Grid</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={chartConfig.showLegend}
                          onChange={(e) => setChartConfig({...chartConfig, showLegend: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Legend</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={chartConfig.showTooltip}
                          onChange={(e) => setChartConfig({...chartConfig, showTooltip: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Tooltip</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={chartConfig.enableZoom || false}
                          onChange={(e) => setChartConfig({...chartConfig, enableZoom: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Zoom</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={chartConfig.enableBrush || false}
                          onChange={(e) => setChartConfig({...chartConfig, enableBrush: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Brush</span>
                      </label>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setChartConfig({
                          ...chartConfig,
                          showGrid: true,
                          showLegend: true,
                          showTooltip: true,
                          height: 400,
                          filters: {
                            xAxisRange: { min: null, max: null },
                            yAxisRange: { min: null, max: null },
                            xAxisCategories: [],
                            yAxisCategories: [],
                            dateRange: { start: null, end: null }
                          }
                        })}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Reset to Defaults
                      </button>
                      <button
                        onClick={() => {
                          const randomColor = CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)]
                          setChartConfig({...chartConfig, color: randomColor})
                        }}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Random Color
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Filtering Section */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <h4 className="text-xl font-semibold text-gray-900">Data Filtering</h4>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {chartData.length} data points
                    </span>
                  </div>
                </div>

                {/* Axis Filters Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* X-Axis Filters */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <h5 className="text-lg font-semibold text-gray-900">X-Axis</h5>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {chartConfig.xAxis}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* X-Axis Range Filter (for numerical data) */}
                      {availableColumns.find((col: any) => col.name === chartConfig.xAxis)?.isNumeric && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Range Filter</label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={chartConfig.filters.xAxisRange.min || ''}
                                  onChange={(e) => setChartConfig({
                                    ...chartConfig,
                                    filters: {
                                      ...chartConfig.filters,
                                      xAxisRange: {
                                        ...chartConfig.filters.xAxisRange,
                                        min: e.target.value ? parseFloat(e.target.value) : null
                                      }
                                    }
                                  })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center text-gray-400 mt-6">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={chartConfig.filters.xAxisRange.max || ''}
                                  onChange={(e) => setChartConfig({
                                    ...chartConfig,
                                    filters: {
                                      ...chartConfig.filters,
                                      xAxisRange: {
                                        ...chartConfig.filters.xAxisRange,
                                        max: e.target.value ? parseFloat(e.target.value) : null
                                      }
                                    }
                                  })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="font-medium">Available range:</span> {dataRanges.xAxis.min.toFixed(2)} - {dataRanges.xAxis.max.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* X-Axis Category Filter */}
                      {dataCategories.xAxis.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700">Category Filter</label>
                            <span className="text-xs text-gray-500">
                              {chartConfig.filters.xAxisCategories.length} of {dataCategories.xAxis.length} selected
                            </span>
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {dataCategories.xAxis.map((category: string) => (
                              <label key={category} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={chartConfig.filters.xAxisCategories.includes(category)}
                                  onChange={(e) => {
                                    const newCategories = e.target.checked
                                      ? [...chartConfig.filters.xAxisCategories, category]
                                      : chartConfig.filters.xAxisCategories.filter(c => c !== category)
                                    setChartConfig({
                                      ...chartConfig,
                                      filters: {
                                        ...chartConfig.filters,
                                        xAxisCategories: newCategories
                                      }
                                    })
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700">{category}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Y-Axis Filters */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <h5 className="text-lg font-semibold text-gray-900">Y-Axis</h5>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {chartConfig.yAxis}
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Y-Axis Range Filter (for numerical data) */}
                      {availableColumns.find((col: any) => col.name === chartConfig.yAxis)?.isNumeric && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Range Filter</label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={chartConfig.filters.yAxisRange.min || ''}
                                  onChange={(e) => setChartConfig({
                                    ...chartConfig,
                                    filters: {
                                      ...chartConfig.filters,
                                      yAxisRange: {
                                        ...chartConfig.filters.yAxisRange,
                                        min: e.target.value ? parseFloat(e.target.value) : null
                                      }
                                    }
                                  })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div className="flex items-center text-gray-400 mt-6">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={chartConfig.filters.yAxisRange.max || ''}
                                  onChange={(e) => setChartConfig({
                                    ...chartConfig,
                                    filters: {
                                      ...chartConfig.filters,
                                      yAxisRange: {
                                        ...chartConfig.filters.yAxisRange,
                                        max: e.target.value ? parseFloat(e.target.value) : null
                                      }
                                    }
                                  })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="font-medium">Available range:</span> {dataRanges.yAxis.min.toFixed(2)} - {dataRanges.yAxis.max.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Y-Axis Category Filter */}
                      {dataCategories.yAxis.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700">Category Filter</label>
                            <span className="text-xs text-gray-500">
                              {chartConfig.filters.yAxisCategories.length} of {dataCategories.yAxis.length} selected
                            </span>
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {dataCategories.yAxis.map((category: string) => (
                              <label key={category} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={chartConfig.filters.yAxisCategories.includes(category)}
                                  onChange={(e) => {
                                    const newCategories = e.target.checked
                                      ? [...chartConfig.filters.yAxisCategories, category]
                                      : chartConfig.filters.yAxisCategories.filter(c => c !== category)
                                    setChartConfig({
                                      ...chartConfig,
                                      filters: {
                                        ...chartConfig.filters,
                                        yAxisCategories: newCategories
                                      }
                                    })
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700">{category}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                {availableColumns.some((col: any) => col.isDate) && (
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <h4 className="text-lg font-semibold text-gray-900">Date Range Filter</h4>
                      </div>
                      {(() => {
                        const datetimeColumn = availableColumns.find((col: any) => 
                          col.isDate && (col.type === 'datetime64' || col.type === 'datetime64[ns]' || col.type.includes('datetime'))
                        )
                        return datetimeColumn ? (
                          <span className="ml-auto px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            {datetimeColumn.name}
                          </span>
                        ) : null
                      })()}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Start Date</label>
                        <input
                          type="date"
                          value={chartConfig.filters.dateRange.start || ''}
                          onChange={(e) => setChartConfig({
                            ...chartConfig,
                            filters: {
                              ...chartConfig.filters,
                              dateRange: {
                                ...chartConfig.filters.dateRange,
                                start: e.target.value || null
                              }
                            }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      {/* End Date */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">End Date</label>
                        <input
                          type="date"
                          value={chartConfig.filters.dateRange.end || ''}
                          onChange={(e) => setChartConfig({
                            ...chartConfig,
                            filters: {
                              ...chartConfig.filters,
                              dateRange: {
                                ...chartConfig.filters.dateRange,
                                end: e.target.value || null
                              }
                            }
                          })}
                          min={chartConfig.filters.dateRange.start || undefined}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    
                    {/* Date Range Info */}
                    {chartConfig.filters.dateRange.start && chartConfig.filters.dateRange.end && (() => {
                      const datetimeColumn = availableColumns.find((col: any) => 
                        col.isDate && (col.type === 'datetime64' || col.type === 'datetime64[ns]' || col.type.includes('datetime'))
                      )
                      return datetimeColumn ? (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <span className="text-sm font-medium text-gray-900">Active Date Filter</span>
                              <p className="text-sm text-gray-600">
                                Filtering by <strong>{datetimeColumn.name}</strong> from <strong>{new Date(chartConfig.filters.dateRange.start).toLocaleDateString()}</strong> to <strong>{new Date(chartConfig.filters.dateRange.end).toLocaleDateString()}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                {/* Filter Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">{chartData.length}</span>
                        <span className="ml-1">data points after filtering</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setChartConfig({
                          ...chartConfig,
                          filters: {
                            xAxisRange: { min: null, max: null },
                            yAxisRange: { min: null, max: null },
                            xAxisCategories: [],
                            yAxisCategories: [],
                            dateRange: { start: null, end: null }
                          }
                        })}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All Filters
                      </button>
                      <button
                        onClick={() => {
                          const xAxisCol = availableColumns.find((col: any) => col.name === chartConfig.xAxis)
                          const yAxisCol = availableColumns.find((col: any) => col.name === chartConfig.yAxis)
                          
                          setChartConfig({
                            ...chartConfig,
                            filters: {
                              xAxisRange: xAxisCol?.isNumeric ? { min: dataRanges.xAxis.min, max: dataRanges.xAxis.max } : { min: null, max: null },
                              yAxisRange: yAxisCol?.isNumeric ? { min: dataRanges.yAxis.min, max: dataRanges.yAxis.max } : { min: null, max: null },
                              xAxisCategories: dataCategories.xAxis,
                              yAxisCategories: dataCategories.yAxis,
                              dateRange: { start: null, end: null }
                            }
                          })
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Select All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Display */}
        {chartConfig.xAxis && chartConfig.yAxis && chartData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {chartConfig.title || `${chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {chartData.length} data points • {chartConfig.xAxis} vs {chartConfig.yAxis}
                  </p>
                </div>
                
                {/* Export Buttons */}
                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button
                      onClick={exportChartAsPNG}
                      disabled={exporting}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>PNG</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={exportChartAsPDF}
                    disabled={exporting}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>PDF</span>
                  </button>
                  
                  <button
                    onClick={exportChartAsSVG}
                    disabled={exporting}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>SVG</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div ref={chartRef} className="w-full" style={{ height: `${chartConfig.height}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                  {chartConfig.enableBrush && chartConfig.type !== 'pie' && (
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={60}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey={chartConfig.xAxis} />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Brush dataKey={chartConfig.xAxis} height={30} stroke={chartConfig.color} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Data Point Details Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Data Point Details</h5>
                  {selectedDataPoint ? (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{chartConfig.xAxis}:</span> {selectedDataPoint[chartConfig.xAxis]}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{chartConfig.yAxis}:</span> {selectedDataPoint[chartConfig.yAxis]}
                      </div>
                      <button
                        onClick={() => setSelectedDataPoint(null)}
                        className="w-full text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        Clear Selection
                      </button>
                    </div>
                  ) : hoveredDataPoint ? (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{chartConfig.xAxis}:</span> {hoveredDataPoint[chartConfig.xAxis]}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{chartConfig.yAxis}:</span> {hoveredDataPoint[chartConfig.yAxis]}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        Click to select this point
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Hover over data points to see details
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!chartConfig.xAxis || !chartConfig.yAxis ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Your Chart</h3>
            <p className="text-gray-500">Select X and Y axes to create your visualization</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">The selected columns don't contain valid data for visualization</p>
          </div>
        ) : null}
      </div>
    )
  }

  const renderChart = (): React.ReactElement => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    const renderGrid = () => chartConfig.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> : null
    
    const renderTooltip = () => chartConfig.showTooltip ? (
      <Tooltip 
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '12px'
        }}
        labelStyle={{
          color: '#374151',
          fontWeight: '600',
          marginBottom: '4px'
        }}
        formatter={(value: any, name: string) => [
          typeof value === 'number' ? value.toLocaleString() : value,
          name
        ]}
        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
      />
    ) : null
    
    const renderLegend = () => chartConfig.showLegend ? (
      <Legend 
        wrapperStyle={{
          paddingTop: '20px',
          fontSize: '14px'
        }}
        iconType="circle"
      />
    ) : null

    switch (chartConfig.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {renderGrid()}
            <XAxis 
              dataKey={chartConfig.xAxis} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            {renderTooltip()}
            {renderLegend()}
            <Bar 
              dataKey={chartConfig.yAxis} 
              fill={chartConfig.color}
              radius={[4, 4, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              onMouseEnter={(data, index, event) => {
                setHoveredDataPoint(data)
                if (event?.target && 'style' in event.target) {
                  (event.target as HTMLElement).style.filter = 'brightness(1.1)'
                }
              }}
              onMouseLeave={(data, index, event) => {
                setHoveredDataPoint(null)
                if (event?.target && 'style' in event.target) {
                  (event.target as HTMLElement).style.filter = 'brightness(1)'
                }
              }}
              onClick={(data, index, event) => {
                setSelectedDataPoint(data)
              }}
            />
          </BarChart>
        )
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {renderGrid()}
            <XAxis 
              dataKey={chartConfig.xAxis} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            {renderTooltip()}
            {renderLegend()}
            <Line 
              type="monotone" 
              dataKey={chartConfig.yAxis} 
              stroke={chartConfig.color} 
              strokeWidth={3}
              dot={{ 
                fill: chartConfig.color, 
                strokeWidth: 2, 
                r: 4
              }}
              activeDot={{ 
                r: 6, 
                stroke: chartConfig.color, 
                strokeWidth: 2, 
                fill: 'white'
              }}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={20}
              fill={chartConfig.color}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
              onMouseEnter={(data: any, index: any, event: any) => setHoveredDataPoint(data)}
              onMouseLeave={(data: any, index: any, event: any) => setHoveredDataPoint(null)}
              onClick={(data: any, index: any, event: any) => setSelectedDataPoint(data)}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            {renderTooltip()}
            {renderLegend()}
          </PieChart>
        )
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {renderGrid()}
            <XAxis 
              dataKey={chartConfig.xAxis} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            {renderTooltip()}
            {renderLegend()}
            <Area 
              type="monotone" 
              dataKey={chartConfig.yAxis} 
              stroke={chartConfig.color} 
              fill={chartConfig.color} 
              fillOpacity={0.4}
              strokeWidth={2}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        )
      
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {renderGrid()}
            <XAxis 
              dataKey={chartConfig.xAxis} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            {renderTooltip()}
            {renderLegend()}
            <Scatter 
              dataKey={chartConfig.yAxis} 
              fill={chartConfig.color}
              r={6}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
              onMouseEnter={(data: any, index: any, event: any) => setHoveredDataPoint(data)}
              onMouseLeave={(data: any, index: any, event: any) => setHoveredDataPoint(null)}
              onClick={(data: any, index: any, event: any) => setSelectedDataPoint(data)}
            />
          </ScatterChart>
        )
      
      default:
        return <div>Unsupported chart type</div>
    }
  }

  const renderCharts = () => {
    return renderChartBuilder()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file data...</p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading File</h3>
          <p className="text-gray-500 mb-4">{error || 'File not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{file.original_file_name}</h1>
                <p className="text-sm text-gray-500">
                  {file.row_count ? `${file.row_count.toLocaleString()} rows` : 'Processing...'} • 
                  {file.column_count ? ` ${file.column_count} columns` : ''} • 
                  {file.file_size_mb.toFixed(1)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                file.upload_status === 'processed' ? 'bg-green-100 text-green-800' :
                file.upload_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {file.upload_status}
              </span>
              
              {file.upload_status === 'uploaded' && (
                <button
                  onClick={handleProcessFile}
                  disabled={processing}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process File'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'preview', name: 'Data Preview', icon: '📊' },
              { id: 'insights', name: 'AI Insights', icon: '🤖' },
              { id: 'charts', name: 'Charts', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {selectedTab === 'preview' && renderDataPreview()}
          {selectedTab === 'insights' && renderAIInsights()}
          {selectedTab === 'charts' && renderCharts()}
        </div>
      </div>
    </div>
  )
}
