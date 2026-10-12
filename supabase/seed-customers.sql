insert into public.customers (name, phone, address, created_at) values
('Nguyễn Văn An',      '0901000001', '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',          now() - interval '58 days'),
('Trần Thị Bích',      '0901000002', '45 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',             now() - interval '55 days'),
('Lê Hoàng Cường',     '0901000003', '88 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh',    now() - interval '52 days'),
('Phạm Minh Đức',      '0901000004', '23 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh',     now() - interval '49 days'),
('Hoàng Thị Em',       '0901000005', '67 Cách Mạng Tháng 8, Phường 10, Quận 3, TP. Hồ Chí Minh',         now() - interval '46 days'),
('Vũ Quốc Phong',      '0901000006', '5 Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',             now() - interval '43 days'),
('Đặng Thu Giang',     '0901000007', '102 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng',                  now() - interval '40 days'),
('Bùi Anh Huy',        '0901000008', '31 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội',                          now() - interval '38 days'),
('Đỗ Thị Lan',         '0901000009', '19 Láng Hạ, Quận Đống Đa, Hà Nội',                                 now() - interval '35 days'),
('Ngô Thanh Khôi',     '0901000010', '76 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',        now() - interval '33 days'),
('Dương Mỹ Linh',      '0901000011', '8 Quốc lộ 20, Thị trấn Định Quán, Huyện Định Quán, Đồng Nai',      now() - interval '30 days'),
('Lý Gia Minh',        '0901000012', '154 Phạm Văn Thuận, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',      now() - interval '27 days'),
('Trịnh Ngọc Nhi',     '0901000013', '39 Trần Hưng Đạo, Phường An Hội, TP. Cần Thơ',                     now() - interval '25 days'),
('Phan Quang Oanh',    '0901000014', '210 Nguyễn Tri Phương, Phường 8, Quận 10, TP. Hồ Chí Minh',        now() - interval '22 days'),
('Võ Thị Phương',      '0901000015', '14 Yersin, Phường 10, TP. Đà Lạt, Lâm Đồng',                       now() - interval '19 days'),
('Mai Xuân Quý',       '0901000016', '55 Lê Duẩn, Phường Tân Thành, TP. Buôn Ma Thuột, Đắk Lắk',         now() - interval '16 days'),
('Cao Thị Rạng',       '0901000017', '27 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội',      now() - interval '13 days'),
('Lâm Đức Sơn',        '0901000018', '90 Hùng Vương, Phường Phú Hội, TP. Huế, Thừa Thiên Huế',           now() - interval '10 days'),
('Tạ Bảo Trân',        '0901000019', '63 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',           now() - interval '6 days'),
('Huỳnh Văn Út',       '0901000020', '4 Đường 30/4, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ',     now() - interval '2 days')
on conflict (phone) do nothing;

-- Kiểm tra kết quả
select count(*) as tong_khach_hang from public.customers;