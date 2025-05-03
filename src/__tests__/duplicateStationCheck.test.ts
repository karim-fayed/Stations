
import { checkDuplicateStation } from '../services/stationService';
import { supabase } from '../integrations/supabase/client';
import type { jest } from '@jest/globals';

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

// Create proper TypeScript types for the mocked functions
const mockedFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;
const mockedSelect = jest.fn().mockReturnThis();
const mockedEq = jest.fn().mockReturnThis();
const mockedMaybeSingle = jest.fn();
const mockedRpc = jest.fn().mockReturnThis();

describe('Duplicate Station Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should detect duplicate station by name', async () => {
    // Mock a duplicate station by name
    mockedFrom.mockReturnThis();
    mockedSelect.mockReturnThis();
    mockedEq.mockReturnThis();
    mockedMaybeSingle.mockResolvedValue({
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

    // Apply mocks to supabase object
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    }));

    const result = await checkDuplicateStation('Test Station', 24.774265, 46.738586);
    
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateStation).toBeDefined();
    expect(result.duplicateStation?.name).toBe('Test Station');
    expect(supabase.from).toHaveBeenCalledWith('stations');
    expect(mockedEq).toHaveBeenCalledWith('name', 'Test Station');
  });

  test('should detect duplicate station by location', async () => {
    // Mock no duplicate by name
    mockedFrom.mockReturnThis();
    mockedSelect.mockReturnThis();
    mockedEq.mockReturnThis();
    mockedMaybeSingle.mockResolvedValue({
      data: null,
      error: null
    });

    // Mock a duplicate by location
    mockedRpc.mockResolvedValue({
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

    // Apply mocks to supabase object
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    }));
    (supabase.rpc as jest.Mock).mockImplementation(mockedRpc);

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
    mockedFrom.mockReturnThis();
    mockedSelect.mockReturnThis();
    mockedEq.mockReturnThis();
    mockedMaybeSingle.mockResolvedValue({
      data: null,
      error: null
    });

    // Mock no duplicate by location (distance > 100m)
    mockedRpc.mockResolvedValue({
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

    // Apply mocks to supabase object
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    }));
    (supabase.rpc as jest.Mock).mockImplementation(mockedRpc);

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586);
    
    expect(result.isDuplicate).toBe(false);
    expect(result.duplicateStation).toBeUndefined();
  });

  test('should handle errors gracefully', async () => {
    // Mock an error
    mockedFrom.mockReturnThis();
    mockedSelect.mockReturnThis();
    mockedEq.mockReturnThis();
    mockedMaybeSingle.mockResolvedValue({
      data: null,
      error: new Error('Database error')
    });

    // Apply mocks to supabase object
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    }));

    await expect(checkDuplicateStation('Test Station', 24.774265, 46.738586))
      .rejects.toThrow();
  });
});
