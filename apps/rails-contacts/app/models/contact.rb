class Contact < ApplicationRecord
  belongs_to :user
  validates :name_first, presence: true, allow_blank: false
  validates :name_last, presence: true, allow_blank: false
end
