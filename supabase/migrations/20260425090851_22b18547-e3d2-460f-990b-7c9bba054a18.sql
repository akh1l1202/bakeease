CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  _role public.app_role;
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );

  if lower(new.email) = 'tyagi.akhil1202@gmail.com' then
    _role := 'admin';
  else
    _role := 'customer';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, _role);

  return new;
end;
$function$;