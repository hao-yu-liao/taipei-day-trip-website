
// booking
create table booking (
    id int auto_increment,
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

DELETE FROM attractions WHERE (id >= 200) and (id < 300);