
import { supabase } from '@/integrations/supabase/client';

/**
 * Fix database functions with search path issues
 */
export async function fixDatabaseFunctions() {
  try {
    // Fix update_station_location function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.update_station_location()
        RETURNS trigger
        LANGUAGE plpgsql
        SET search_path = 'public'
        AS $function$
        BEGIN
          NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
          RETURN NEW;
        END;
        $function$
      `
    });

    // Fix update_location_column function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.update_location_column()
        RETURNS trigger
        LANGUAGE plpgsql
        SET search_path = 'public'
        AS $function$
        BEGIN
          -- استخدام ST_SetSRID و ST_MakePoint لإنشاء نقطة جغرافية باستخدام lat و lon
          NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
          RETURN NEW;
        END;
        $function$
      `
    });

    // Fix extract_cities_from_stations function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.extract_cities_from_stations()
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = 'public'
        AS $function$
        BEGIN
          -- Delete all existing cities
          DELETE FROM public.cities;
          
          -- Extract unique cities from stations table
          INSERT INTO public.cities (name_ar, name_en, latitude, longitude)
          SELECT DISTINCT
            region AS name_ar,
            region AS name_en,
            AVG(latitude) AS latitude,
            AVG(longitude) AS longitude
          FROM public.stations
          WHERE region IS NOT NULL AND region != ''
          GROUP BY region;
          
          RETURN;
        END;
        $function$
      `
    });

    // Fix find_nearest_stations function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.find_nearest_stations(lat double precision, lng double precision, limit_count integer DEFAULT 5)
        RETURNS TABLE(id uuid, name text, region text, sub_region text, latitude double precision, longitude double precision, fuel_types text, additional_info text, distance_meters double precision)
        LANGUAGE plpgsql
        SET search_path = 'public'
        AS $function$
        BEGIN
          RETURN QUERY
          SELECT s.id, s.name, s.region, s.sub_region, s.latitude, s.longitude, s.fuel_types, s.additional_info,
                ST_Distance(s.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters
          FROM stations s
          ORDER BY s.location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
          LIMIT limit_count;
        END;
        $function$
      `
    });

    // Fix execute_sql function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.execute_sql(query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = 'public'
        AS $function$
        BEGIN
          EXECUTE query;
        END;
        $function$
      `
    });

    // Fix update_cities_after_station_changes function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.update_cities_after_station_changes()
        RETURNS trigger
        LANGUAGE plpgsql
        SET search_path = 'public'
        AS $function$
        BEGIN
          PERFORM public.extract_cities_from_stations();
          RETURN NULL;
        END;
        $function$
      `
    });

    // Fix handle_new_user function
    await supabase.rpc('execute_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = 'public'
        AS $function$
        BEGIN
          INSERT INTO public.admin_users (id, email, name, role)
          VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin'), 'admin');
          RETURN NEW;
        END;
        $function$
      `
    });

    console.log('Successfully fixed all database functions with search path issues');
    return { success: true, message: 'تم إصلاح جميع دوال قاعدة البيانات بنجاح' };
  } catch (error) {
    console.error('Error fixing database functions:', error);
    return { success: false, error: 'حدث خطأ أثناء إصلاح دوال قاعدة البيانات' };
  }
}

/**
 * Fix Auth OTP Long Expiry and Leaked Password Protection Issues
 */
export async function fixAuthIssues() {
  try {
    // Note: These might require admin privileges in Supabase dashboard
    // as they're typically configured through the Supabase admin interface
    console.log('Auth issues need to be fixed through Supabase Dashboard');
    return {
      success: false,
      message: 'يجب معالجة مشاكل المصادقة من خلال لوحة تحكم Supabase:\n' +
               '1. ضبط مدة صلاحية رموز OTP\n' +
               '2. تفعيل حماية كلمات المرور المسربة'
    };
  } catch (error) {
    console.error('Error fixing auth issues:', error);
    return { success: false, error: 'حدث خطأ أثناء محاولة إصلاح مشاكل المصادقة' };
  }
}
