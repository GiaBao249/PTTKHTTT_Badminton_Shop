CREATE TABLE `Suppliers` (
  `Supplier_id` INT,
  `Supplier_name` VARCHAR(80),
  `Address` VARCHAR(255),
  `Phone` VARCHAR(10),
  PRIMARY KEY (`Supplier_id`)
);

CREATE TABLE `Category` (
  `Category_id` INT,
  `Category_name` VARCHAR(255),
  PRIMARY KEY (`Category_id`)
);

CREATE TABLE `Product` (
  `Product_id` INT,
  `Supplier_id` INT,
  `Category_id` INT,
  `Product_name` VARCHAR(50),
  `Price` INT,
  `Description` TEXT,
  `Warranty_period` INT,
  PRIMARY KEY (`Product_id`),
  FOREIGN KEY (`Supplier_id`)
      REFERENCES `Suppliers`(`Supplier_id`),
  FOREIGN KEY (`Category_id`)
      REFERENCES `Category`(`Category_id`)
);

CREATE TABLE `Product_item` (
  `Product_item_id` INT,
  `Product_id` INT,
  `Quantity` INT,
  PRIMARY KEY (`Product_item_id`),
  FOREIGN KEY (`Product_id`)
      REFERENCES `Product`(`Product_id`)
);

CREATE TABLE `Customer` (
  `Customer_id` INT,
  `Customer_name` VARCHAR(50),
  `Customer_gender` VARCHAR(50),
  `Customer_phone` INT,
  PRIMARY KEY (`Customer_id`)
);

CREATE TABLE `Order` (
  `Order_id` INT,
  `Customer_id` INT,
  `Status` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
  `Total_amount` INT,
  `Order_date` DATETIME,
  `Delivery_date` DATETIME,
  PRIMARY KEY (`Order_id`),
  FOREIGN KEY (`Customer_id`)
      REFERENCES `Customer`(`Customer_id`)
);

CREATE TABLE `OrderDetail` (
  `Product_item_id` INT,
  `Order_id` INT,
  `Quantity` INT,
  `Amount` INT,
  PRIMARY KEY (`Product_item_id`, `Order_id`),
  FOREIGN KEY (`Product_item_id`)
      REFERENCES `Product_item`(`Product_item_id`),
  FOREIGN KEY (`Order_id`)
      REFERENCES `Order`(`Order_id`)
);

CREATE TABLE `CustomerAccounts` (
  `Username` VARCHAR(80),
  `Customer_id` INT,
  `Password` VARCHAR(80),
  PRIMARY KEY (`Username`),
  FOREIGN KEY (`Customer_id`)
      REFERENCES `Customer`(`Customer_id`)
);

CREATE TABLE `Product_image` (
  `image_id` INT,
  `Product_item_id` INT,
  `image_filename` VARCHAR(255),
  PRIMARY KEY (`image_id`),
  FOREIGN KEY (`Product_item_id`)
      REFERENCES `Product_item`(`Product_item_id`)
);

CREATE TABLE `Employees` (
  `Employ_id` INT,
  `Name` VARCHAR(255),
  `Phone` VARCHAR(10),
  `Address` VARCHAR(255),
  `Date` DATE,
  PRIMARY KEY (`Employ_id`)
);

CREATE TABLE `AdminAccounts` (
  `Username` VARCHAR(80),
  `Employee_id` int,
  `Password` INT,
  PRIMARY KEY (`Username`),
  FOREIGN KEY (`Employee_id`)
      REFERENCES `Employees`(`Employ_id`)
);

CREATE TABLE `Variation` (
  `Variation_id` INT,
  `Category_id` INT,
  `name` VARCHAR(100),
  PRIMARY KEY (`Variation_id`),
  FOREIGN KEY (`Category_id`)
      REFERENCES `Category`(`Category_id`)
);

CREATE TABLE `Variation_options` (
  `Variation_option_id` INT,
  `Variation_id` INT,
  `Value` VARCHAR(100),
  PRIMARY KEY (`Variation_option_id`),
  FOREIGN KEY (`Variation_id`)
      REFERENCES `Variation`(`Variation_id`)
);

CREATE TABLE `Product_configuration` (
  `Product_item_id` INT,
  `Variation_option_id` INT,
  FOREIGN KEY (`Product_item_id`)
      REFERENCES `Product_item`(`Product_item_id`),
  FOREIGN KEY (`Variation_option_id`)
      REFERENCES `Variation_options`(`Variation_option_id`)
);

CREATE TABLE `Cart` (
  `Cart_id` INT,
  `Customer_id` INT,
  PRIMARY KEY (`Cart_id`),
  FOREIGN KEY (`Customer_id`)
      REFERENCES `Customer`(`Customer_id`)
);

CREATE TABLE `CartItems` (
  `Cart_id` INT,
  `Product_item_id` INT,
  `Quantity` INT,
  `Total_amount` INT,
  PRIMARY KEY (`Cart_id`, `Product_item_id`),
  FOREIGN KEY (`Cart_id`)
      REFERENCES `Cart`(`Cart_id`),
  FOREIGN KEY (`Product_item_id`)
      REFERENCES `Product_item`(`Product_item_id`)
);

CREATE TABLE `PurchaseOrders` (
  `PurchaseOrder_id` INT,
  `Supplier_id` INT,
  `Employee_id` INT,
  PRIMARY KEY (`PurchaseOrder_id`),
  FOREIGN KEY (`Supplier_id`)
      REFERENCES `Suppliers`(`Supplier_id`),
  FOREIGN KEY (`Employee_id`)
      REFERENCES `Employees`(`Employ_id`)
);

