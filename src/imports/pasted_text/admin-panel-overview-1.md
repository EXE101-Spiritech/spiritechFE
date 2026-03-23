Spiritech Admin Panel 
1. Purpose
The Spiritech Admin Panel is an internal dashboard used by administrators to manage the core operations of the platform.
For the MVP demo, the admin panel will allow administrators to:
manage the product catalog


manage inventory


create and edit events


manage website content


view basic sales analytics


review orders and user activity


The interface should prioritize simplicity, clarity, and speed of operation, focusing only on the features required to demonstrate the platform’s functionality.

2. Admin Panel Layout
The admin panel should follow a standard dashboard structure.
Layout Structure
------------------------------------------------
Top Bar (admin info + logout)
------------------------------------------------
Sidebar Navigation | Main Content Workspace
                  |
                  |
                  |
Sidebar Navigation (MVP)
The sidebar should contain only the core modules:
Dashboard
Products
Inventory
Orders
Events
CMS
Analytics
Users
Each module opens a workspace view in the main content area.

3. Dashboard
The Dashboard provides a quick overview of platform activity.
Dashboard Metrics
Displayed as simple metric cards.
Metric
Description
Total Orders
Number of orders processed
Total Revenue
Total sales value
Active Products
Number of available products
Upcoming Events
Number of scheduled events
Registered Users
Total user accounts

Dashboard Visualizations
For the MVP, include one simple chart:
Sales Over Time
This chart should show daily sales trends.

4. Product Management
This module allows admins to manage the product catalog displayed in the store.
Product List View
A table displaying:
Field
Product Name
Category
Price
Stock Quantity
Status (Active / Hidden)

Admins can:
create new products


edit product details


delete products



Product Creation / Edit Form
Fields:
Product Name
Category
Description
Price
Stock Quantity
Product Image
Optional fields for SEO can be hidden for MVP.

5. Inventory Management
The inventory page allows admins to track and update stock levels.
Inventory Table
Field
Product Name
SKU
Stock Quantity
Low Stock Warning

Admin Actions
Admins can:
manually adjust stock quantity


restock items


If stock falls below threshold, the UI should highlight the item.

6. Order Management
This module allows admins to monitor customer purchases.
Order List
Displayed as a table.
Field
Order ID
Customer
Order Date
Total Amount
Payment Status
Order Status

Order Detail Page
Admins can view:
purchased items


shipping information


payment status


For MVP, order status can be limited to:
Pending
Paid
Completed

7. Event Management
This module allows admins to manage spiritual events.
Event List
Field
Event Name
Event Date
Location
Registered Users

Event Form
Admins can create or edit events with:
Event Name
Description
Event Date
Location
Capacity
Event Image

8. CMS Module
The CMS module allows admins to update basic website content.
Editable Content Sections
For MVP, allow editing:
Homepage introduction text


About page content


Event descriptions


CMS Editor
A simple rich text editor with:
bold / italic


image upload


link insertion


A preview button should allow admins to review changes before publishing.

9. User Management
Admins can view registered users. but personal info are hidden and only the few last characters of sensitive info like phone or email can be seen
User Table
Field
User ID
Email
Phone
Registration Date



10. Analytics Viewer
The analytics module provides basic insights for demonstration purposes.
Charts
Sales Trend Chart


Top Selling Products


This data can be derived from the order database.



Module
MVP Scope
 Dashboard
Basic metrics + 1 chart
Products
CRUD product catalog
Inventory
Stock quantity management
Orders
Order monitoring
Events
Event creation and tracking
CMS
Edit basic website content
Users
View and disable users
Analytics
Sales trend + top products


