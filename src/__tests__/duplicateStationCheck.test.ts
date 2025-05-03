
import { checkDuplicateStation } from '../services/stationService';
import { supabase } from '../integrations/supabase/client';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { GasStation } from '../types/station';

// Mock supabase client
jest.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

// Create proper TypeScript types for the mocked functions
const mockedFrom = supabase.from as jest.Mock;
const mockedSelect = jest.fn().mockReturnThis();
const mockedEq = jest.fn().mockReturnThis();
const mockedMaybeSingle = jest.fn();

// Define expected type for checkDuplicateStation result
interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateStation?: GasStation;
  duplicateType?: 'name' | 'location';
}

// Group tests
describe('checkDuplicateStation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return isDuplicate false when no duplicate found', async () => {
    // Mock the response for the station check by name
    mockedFrom.mockReturnValue({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    });

    // Mock return values
    mockedMaybeSingle.mockResolvedValue({ data: null });

    // Mock the RPC call for distance check
    const mockedRpc = jest.fn().mockReturnValue({
      data: null
    });
    (supabase.rpc as jest.Mock).mockImplementation(() => mockedRpc);

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586) as DuplicateCheckResult;
    
    // Verify the function was called with the correct parameters
    expect(mockedFrom).toHaveBeenCalledWith('stations');
    expect(mockedSelect).toHaveBeenCalled();
    expect(mockedEq).toHaveBeenCalledWith('name', 'New Station');
    expect(mockedMaybeSingle).toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalled();
    expect(result.isDuplicate).toBe(false);
  });

  test('should return isDuplicate true when exact name duplicate found', async () => {
    // Mock the response for the station check by name
    mockedFrom.mockReturnValue({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    });

    // Mock return value for exact name match
    const mockStation = {
      id: '123',
      name: 'New Station',
      latitude: 24.774265,
      longitude: 46.738586,
      region: 'Riyadh'
    };
    mockedMaybeSingle.mockResolvedValue({ data: mockStation });

    // Mock the RPC call for distance check (not needed for this test case)
    const mockedRpc = jest.fn().mockReturnValue({
      data: null
    });
    (supabase.rpc as jest.Mock).mockImplementation(() => mockedRpc);

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586) as DuplicateCheckResult;
    
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateStation).toEqual(mockStation);
    expect(result.duplicateType).toBe('name');
  });

  test('should return isDuplicate true when nearby station found', async () => {
    // Mock the response for the station check by name (no match by name)
    mockedFrom.mockReturnValue({
      select: mockedSelect,
      eq: mockedEq,
      maybeSingle: mockedMaybeSingle
    });
    mockedMaybeSingle.mockResolvedValue({ data: null });

    // Mock the RPC call for distance check
    const nearbyStation = {
      id: '456',
      name: 'Nearby Station',
      latitude: 24.774275,
      longitude: 46.738596,
      region: 'Riyadh',
      distance_meters: 50 // Close distance
    };
    
    const mockedRpc = jest.fn().mockReturnValue({
      data: [nearbyStation]
    });
    (supabase.rpc as jest.Mock).mockImplementation(() => mockedRpc);

    const result = await checkDuplicateStation('New Station', 24.774265, 46.738586) as DuplicateCheckResult;
    
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateStation).toEqual(nearbyStation);
    expect(result.duplicateType).toBe('location');
  });
});
