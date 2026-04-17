-- Add validation constraints to public-insertable tables
alter table public.orders
  add constraint orders_name_len check (char_length(customer_name) between 2 and 200),
  add constraint orders_email_fmt check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(customer_email) <= 255),
  add constraint orders_phone_len check (char_length(customer_phone) between 6 and 30),
  add constraint orders_addr_len check (char_length(shipping_address) between 3 and 300),
  add constraint orders_city_len check (char_length(shipping_city) between 2 and 100),
  add constraint orders_zip_len check (char_length(shipping_zip) between 3 and 15),
  add constraint orders_notes_len check (notes is null or char_length(notes) <= 1000),
  add constraint orders_items_size check (jsonb_array_length(items) between 1 and 50);

alter table public.distributor_leads
  add constraint leads_name_len check (char_length(full_name) between 2 and 200),
  add constraint leads_company_len check (char_length(company) between 2 and 200),
  add constraint leads_city_len check (char_length(city) between 2 and 100),
  add constraint leads_phone_len check (char_length(phone) between 6 and 30),
  add constraint leads_email_fmt check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  add constraint leads_msg_len check (message is null or char_length(message) <= 2000);