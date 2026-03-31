import { render, screen } from '@testing-library/react';
import TopToolbar from '@/components/panels/TopToolbar';
import { useCanvasStore } from '@/store/useCanvasStore';

// Mock the canvas store
vi.mock('@/store/useCanvasStore', () => ({
  useCanvasStore: vi.fn(),
}));

// Mock useTheme hook
vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({ theme: 'dark', setTheme: vi.fn() })),
}));


describe('TopToolbar', () => {
  const mockStore = {
    activeTool: 'select',
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    showSmartGuides: true,
    setActiveTool: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    centerCanvas: vi.fn(),
    toggleGrid: vi.fn(),
    toggleSnapToGrid: vi.fn(),
    toggleSmartGuides: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    clearCanvas: vi.fn(),
    exportToJSON: vi.fn(),
    importFromJSON: vi.fn(),
  };

  beforeEach(() => {
    useCanvasStore.mockReturnValue(mockStore);
  });

  it('renders all tool buttons', () => {
    render(<TopToolbar />);
    
    expect(screen.getByLabelText('Select')).toBeInTheDocument();
    expect(screen.getByLabelText('Rectangle')).toBeInTheDocument();
    expect(screen.getByLabelText('Circle')).toBeInTheDocument();
    expect(screen.getByLabelText('Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Line')).toBeInTheDocument();
    expect(screen.getByLabelText('Arrow')).toBeInTheDocument();
    expect(screen.getByLabelText('Star')).toBeInTheDocument();
    expect(screen.getByLabelText('Polygon')).toBeInTheDocument();
    expect(screen.getByLabelText('Pan')).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    render(<TopToolbar />);
    
    expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders undo/redo buttons', () => {
    render(<TopToolbar />);
    
    expect(screen.getByLabelText('Undo')).toBeInTheDocument();
    expect(screen.getByLabelText('Redo')).toBeInTheDocument();
  });

  it('has proper toolbar role and label', () => {
    render(<TopToolbar />);
    
    expect(screen.getByRole('toolbar', { name: 'CanvasFlow main toolbar' })).toBeInTheDocument();
  });

  it('disables undo when cannot undo', () => {
    mockStore.canUndo.mockReturnValue(false);
    render(<TopToolbar />);
    
    expect(screen.getByLabelText('Undo')).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables undo when can undo', () => {
    mockStore.canUndo.mockReturnValue(true);
    render(<TopToolbar />);
    
    expect(screen.getByLabelText('Undo')).toHaveAttribute('aria-disabled', 'false');
  });
});
