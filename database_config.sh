# 把 booking 多加 status
alter table booking
add status int default 2

update booking set status = 2

# order
create table orders (
    id int auto_increment,
    number varchar(255) not null,
    status int default 1,
    rec_trade_id varchar(255) default "",
    bank_transaction_id varchar(255) default "",
    phone varchar(255) not null,
    createTime timestamp default current_timestamp,
    userId int not null,
    attractionId int not null,
    bookingId int not null,
    primary key(id),
    constraint FK_Order_userId foreign key (userId) references user(id),
    constraint FK_Order_attractionId foreign key (attractionId) references attractions(id),
    constraint FK_Order_bookingId foreign key (bookingId) references booking(id)
);

# 測試資料
insert into orders (number, status, rec_trade_id, bank_transaction_id, phone, userId, attractionId, bookingId) values(20210611121500, 0, "", "", '0912345678', 9, 5, 15)

# checkOrder：測試資料
select orders.number, orders.phone, booking.price, booking.date, booking.time, attractions.id, attractions.name, attractions.address, attractions.images from ((orders inner join booking on orders.bookingId = booking.id) inner join attractions on orders.attractionId = attractions.id) where orders.id = 3

#
select * from orders where (createTime > subtime(current_timestamp(), '0:5:0')) and (userId = '9')

#
select * from orders where bookingId = (select max(bookingId) from orders where userId = "9")

select *  from orders where id = (select max(id) from orders where userId = "9")

###########################################################

# booking
create table booking (
    id int NOT NULL auto_increment,
    date date not null,
    time varchar(255) not null,
    price int not null,
    userId int not null,
    attractionId int not null,
    createTime timestamp default current_timestamp,
    primary key(id),
    constraint FK_Booking_userId foreign key (userId) references user(id),
    constraint FK_Booking_attractionId foreign key (attractionId) references attractions(id)
);

alter table booking
add createTime timestamp default current_timestamp

alter table booking
add userId int not null

alter table booking
add attractionId int not null

ALTER TABLE booking
ADD CONSTRAINT FK_Booking_userId
FOREIGN KEY (userId) REFERENCES user(id)

ALTER TABLE booking
ADD CONSTRAINT FK_Booking_attractionId
FOREIGN KEY (attractionId) REFERENCES attractions(id)

create table booking (
id int auto_increment,
attractionId int not null,
createTime timestamp default current_timestamp,
primary key(id),
constraint FK_Booking_userId foreign key (userId) references user(id),
constraint FK_Booking_attractionId foreign key (attractionId) references attractions(id)
);

date date not null,
time varchar(255) not null,
price int not null,
userId int not null,


insert into booking (date, time, price, userId, attractionId) values ('2021-06-30', 'afternoon', '2000', '10', '1');

# date format: YYYY-MM-DD

select * from booking where createTime > subtime(current_timestamp(), '0:5:0');
select * from booking where (createTime > subtime(current_timestamp(), '0:5:0')) and (userId = '9');


select booking.id, booking.attractionId, attractions.name, attractions.address, attractions.images, booking.date, booking.time, booking.price from booking inner join attractions on booking.attractionId = attractions.id where booking.userId = '10';
