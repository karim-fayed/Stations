/**
 * وحدة لإصلاح مشاكل قاعدة البيانات تلقائيًا
 * تقوم بتنفيذ إصلاحات SQL عند بدء التطبيق
 */

import { supabase } from './client';
import logger from '@/utils/logger';

/**
 * إصلاح دالة تحديث المحطة
 * يقوم بإنشاء الدالة بالمعلمات الصحيحة
 */
export const fixUpdateStationFunction = async (): Promise<boolean> => {
  try {
    logger.debug('Attempting to fix update_station function...');

    // SQL لإصلاح دالة تحديث المحطة
    const fixSQL = `
      -- Drop the existing function if it exists
      DROP FUNCTION IF EXISTS public.update_station(UUID, JSONB);

      -- Create the function with the correct parameter names
      CREATE OR REPLACE FUNCTION public.update_station(
          p_station_id UUID,
          p_station_data JSONB
      ) RETURNS SETOF stations AS $$
      BEGIN
          RETURN QUERY
          UPDATE public.stations SET
              name = COALESCE(p_station_data->>'name', name),
              region = COALESCE(p_station_data->>'region', region),
              sub_region = COALESCE(p_station_data->>'sub_region', sub_region),
              latitude = COALESCE((p_station_data->>'latitude')::numeric, latitude),
              longitude = COALESCE((p_station_data->>'longitude')::numeric, longitude),
              fuel_types = COALESCE(p_station_data->>'fuel_types', fuel_types),
              additional_info = COALESCE(p_station_data->>'additional_info', additional_info),
              updated_at = now()
          WHERE id = p_station_id
          RETURNING *;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION public.update_station(UUID, JSONB) TO authenticated;
    `;

    // تنفيذ الكود SQL
    const { error } = await supabase.rpc('execute_sql', { sql_query: fixSQL });

    if (error) {
      // إذا فشل استدعاء RPC، نحاول إنشاء الدالة أولاً
      logger.warn('Failed to execute SQL directly, trying to create execute_sql function first:', error);
      
      // إنشاء دالة execute_sql إذا لم تكن موجودة
      await createExecuteSqlFunction();
      
      // محاولة تنفيذ الإصلاح مرة أخرى
      const secondAttempt = await supabase.rpc('execute_sql', { sql_query: fixSQL });
      
      if (secondAttempt.error) {
        logger.error('Failed to fix update_station function after creating execute_sql:', secondAttempt.error);
        return false;
      }
    }

    logger.debug('Successfully fixed update_station function');
    return true;
  } catch (error) {
    logger.error('Error fixing update_station function:', error);
    return false;
  }
};

/**
 * إنشاء دالة execute_sql إذا لم تكن موجودة
 * هذه الدالة تسمح بتنفيذ كود SQL من خلال RPC
 */
export const createExecuteSqlFunction = async (): Promise<boolean> => {
  try {
    logger.debug('Creating execute_sql function...');

    // استخدام طريقة بديلة لتنفيذ SQL مباشرة
    // هذا يتطلب صلاحيات مدير قاعدة البيانات
    const { error } = await supabase.rpc('create_execute_sql_function');

    if (error) {
      logger.error('Failed to create execute_sql function:', error);
      return false;
    }

    logger.debug('Successfully created execute_sql function');
    return true;
  } catch (error) {
    logger.error('Error creating execute_sql function:', error);
    return false;
  }
};

/**
 * تنفيذ جميع إصلاحات قاعدة البيانات
 */
export const applyDatabaseFixes = async (): Promise<void> => {
  try {
    logger.debug('Applying database fixes...');
    
    // محاولة إنشاء دالة execute_sql أولاً
    await createExecuteSqlFunction();
    
    // تنفيذ إصلاح دالة تحديث المحطة
    const updateStationFixed = await fixUpdateStationFunction();
    
    if (updateStationFixed) {
      logger.debug('Successfully applied all database fixes');
    } else {
      logger.warn('Some database fixes could not be applied');
    }
  } catch (error) {
    logger.error('Error applying database fixes:', error);
  }
};

export default {
  applyDatabaseFixes,
  fixUpdateStationFunction,
  createExecuteSqlFunction
};
