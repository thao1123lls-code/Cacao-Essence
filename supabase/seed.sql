-- Dữ liệu sản phẩm ban đầu
insert into public.products (id, category, name_vi, name_en, brand, price, in_stock, image, sort) values
('p1', 'powder', 'Bột cacao 3 in 1 250g', '3-in-1 Cacao Powder 250g', 'Vinchoco · 3 in 1', 60000, true, '/images/products/p1.webp', 1),
('p2', 'powder', 'Bột ca cao 3 in 1 Vinchoco 1kg', '3-in-1 Cacao Powder 1kg', 'Vinchoco · 3 in 1', 220000, true, '/images/products/p2.webp', 2),
('p3', 'powder', 'Bột ca cao nguyên chất Vinchoco 400g', 'Pure Cacao Powder 400g', 'Vinchoco · Nguyên chất', 165000, true, '/images/products/p3.webp', 3),
('p4', 'powder', 'Bột ca cao 3 in 1 Vinchoco 400g', '3-in-1 Cacao Powder 400g', 'Vinchoco · 3 in 1', 110000, true, '/images/products/p4.webp', 4),
('p5', 'powder', 'Bột ca cao 3 in 1 Vinchoco 200g', '3-in-1 Cacao Powder 200g', 'Vinchoco · 3 in 1', 65000, true, '/images/products/p5.webp', 5),
('p6', 'powder', 'Bột cacao nguyên chất 250g', 'Pure Cacao Powder 250g', 'Vinchoco · Nguyên chất', 105000, true, '/images/products/p6.webp', 6),
('p7', 'powder', 'Bột ca cao sữa dừa 500g', 'Coconut Milk Cacao Powder 500g', 'Vinchoco · Sữa dừa', 168000, true, '/images/products/p7.webp', 7),
('p8', 'chocolate', 'Sô-cô-la sữa hạt Macca', 'Milk Chocolate with Macadamia', 'Bungo', 30000, true, '/images/products/p8.webp', 8),
('p9', 'chocolate', 'Sô-cô-la sữa hạt Chia', 'Milk Chocolate with Chia Seeds', 'Bungo', 30000, true, '/images/products/p9.webp', 9),
('p10', 'chocolate', 'Sô-cô-la hạt bàng', 'Tropical Almond Chocolate Gift Box', 'Bungo · Hộp quà', 0, true, '/images/products/p10.webp', 10),
('p11', 'chocolate', 'Sô-cô-la hạt cà phê', 'Coffee Bean Chocolate', 'Bungo', 30000, true, '/images/products/p11.webp', 11),
('p12', 'chocolate', 'Sô-cô-la trà xanh', 'Green Tea Chocolate', 'Bungo', 30000, true, '/images/products/p12.webp', 12),
('p13', 'chocolate', 'Sô-cô-la ngòi', 'Cacao Nibs Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p13.webp', 13),
('p14', 'chocolate', 'Sô-cô-la gừng', 'Ginger Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p14.webp', 14),
('p15', 'chocolate', 'Sô-cô-la đắng', 'Dark Chocolate', 'Bungo · OCOP', 32000, true, '/images/products/p15.webp', 15),
('p16', 'chocolate', 'Sô-cô-la nguyên chất 85%', 'Dark Chocolate 85%', 'Bungo · Origin Định Quán', 37000, true, '/images/products/p16.webp', 16),
('p17', 'chocolate', 'Sô-cô-la nguyên chất 72%', 'Dark Chocolate 72%', 'Bungo · Origin Định Quán', 35000, true, '/images/products/p17.webp', 17),
('p18', 'chocolate', 'Sô-cô-la hạt điều', 'Cashew Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p18.webp', 18),
('p19', 'chocolate', 'Sô-cô-la đậu phộng', 'Peanut Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p19.webp', 19),
('p20', 'chocolate', 'Sô-cô-la hạnh nhân', 'Almond Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p20.webp', 20),
('p21', 'chocolate', 'Sô-cô-la sữa', 'Milk Chocolate', 'Bungo · Bean to bar', 30000, true, '/images/products/p21.webp', 21)
on conflict (id) do update set name_vi=excluded.name_vi, name_en=excluded.name_en, brand=excluded.brand, price=excluded.price, image=excluded.image, sort=excluded.sort;
