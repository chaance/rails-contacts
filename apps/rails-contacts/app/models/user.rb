class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
      record.errors.add attribute, (options[:message] || "is not an email")
    end
  end
end

class User < ApplicationRecord
  has_secure_password
  has_many :contacts
  validates :email, presence: true, allow_blank: false, email: true, uniqueness: { case_sensitive: false }
  validates :password_digest, presence: true, confirmation: true
end
