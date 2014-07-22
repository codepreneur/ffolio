class Image < ActiveRecord::Base
	validates :url, uniqueness: true, presence: true

end
