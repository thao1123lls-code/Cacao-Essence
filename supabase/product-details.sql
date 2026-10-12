

alter table public.products
  add column if not exists weight         text,   -- khối lượng tịnh, vd: '250g'. Để trống: lấy từ tên sản phẩm nếu có
  add column if not exists ingredients_vi text,   -- thành phần
  add column if not exists ingredients_en text,
  add column if not exists shelf_life_vi  text,   -- hạn sử dụng
  add column if not exists shelf_life_en  text,
  add column if not exists storage_vi     text,   -- hướng dẫn bảo quản
  add column if not exists storage_en     text;

