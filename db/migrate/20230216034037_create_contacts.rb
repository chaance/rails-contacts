class CreateContacts < ActiveRecord::Migration[7.0]
  def change
    create_table :contacts do |t|
      t.string :name_first, null: false
      t.string :name_last, null: false
      t.string :avatar
      t.string :twitter_handle
      t.string :notes
      t.boolean :favorite

      t.timestamps
    end
  end
end
