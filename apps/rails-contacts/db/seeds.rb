User.destroy_all
Contact.destroy_all

User.create!([
  {
    email: "chance.strickland@shopify.com",
    password: "Test321!",
    name_first: "Chance",
    name_last: "Strickland"
  }
])

p "Created #{User.count} users"
