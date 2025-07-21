-- Update the handle_new_user function to create a default account for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_account_id UUID;
BEGIN
  -- Create a new account for the user
  INSERT INTO public.accounts (name, timezone)
  VALUES ('Minha Frota', 'America/Recife')
  RETURNING id INTO new_account_id;
  
  -- Insert the user profile with the new account_id
  INSERT INTO public.users (id, email, account_id, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    new_account_id,
    'owner'
  );
  RETURN NEW;
END;
$function$;