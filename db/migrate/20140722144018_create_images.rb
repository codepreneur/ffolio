class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :url
      t.datetime :created_at

      t.timestamps
    end
  end
end
