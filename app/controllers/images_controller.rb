class ImagesController < ApplicationController

	def index
		images = Image.all.order(created_at: :desc)
		render json: images
	end

	def create
		image = Image.create(url: params[:url])
		render json: image
	end

	def destroy
	end

end