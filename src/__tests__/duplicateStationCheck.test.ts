import { checkDuplicateStation } from '../services/stationService';
import { supabase } from '../integrations/supabase/client';

// Mock supabase client
jest.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    rpc: jest.fn().mockReturnThis(),
  }
}));

describe('Duplicate Station Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should detect duplicate station by name', async () => {
    // Mock a duplicate station by name
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
    (supabase.maybeSingle as jest.Mock).mockResolvedValue({
      data: {
        id: '123',
        name: 'Test Station',
        latitude: 24.774265,
        longitude: 46.738586,
        region: 'Riyadh',
        sub_region: 'Test Area'
      },
      error: null
    });

    const result = await checkDuplicateStation('Test Station', 24.774265, 46.738586);
    
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateStation).toBeDefined();
    expect(result.duplicateStation?.name).toBe('Test Station');
    expect(supabase.from).toHaveBeenCalledWith('stations');
    expect(supabase.eq).toHaveBeenCalledWith('name', 'Test Station');
  });

  test('should detect duplicate station by location', async () => {
    // Mock no duplicate by name
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
    (supabase.maybeSingle as jest.Mock).mockResolvedValue({
      data: null,
      error: null
    });

    // Mock a duplicate by location
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [{
        id: '456',
        name: 'Nearby Station',
        latitude: 24.774266,
        longitude: 46.738587,
        region: 'Riyadh',
        sub_region: 'Test Area',
        distance_meters: 50 // Less than 100 meters
      }],
      error: null
    });

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586);
    
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateStation).toBeDefined();
    expect(result.duplicateStation?.name).toBe('Nearby Station');
    expect(result.duplicateStation?.distance_meters).toBeLessThan(100);
    expect(supabase.rpc).toHaveBeenCalledWith('find_nearest_stations', {
      lat: 24.774265,
      lng: 46.738586,
      limit_count: 1
    });
  });

  test('should not detect duplicate when no match', async () => {
    // Mock no duplicate by name
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
    (supabase.maybeSingle as jest.Mock).mockResolvedValue({
      data: null,
      error: null
    });

    // Mock no duplicate by location (distance > 100m)
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [{
        id: '789',
        name: 'Far Station',
        latitude: 24.775265,
        longitude: 46.739586,
        region: 'Riyadh',
        sub_region: 'Test Area',
        distance_meters: 150 // More than 100 meters
      }],
      error: null
    });

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586);
    
    expect(result.isDuplicate).toBe(false);
    expect(result.duplicateStation).toBeUndefined();
  });

  test('should handle errors gracefully', async () => {
    // Mock an error
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.select as jest.Mock).mockReturnThis();
    (supabase.eq as jest.Mock).mockReturnThis();
    (supabase.maybeSingle as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Database error')
    });

    await expect(checkDuplicateStation('Test Station', 24.774265, 46.738586))
      .rejects.toThrow();
  });
});
