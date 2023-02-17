class ContactsController < ApplicationController
  skip_before_action :authenticate_request, only: [:show, :index]

  def index
    @contacts = Contact.all
    render json: @contacts
  end

  def show
    @contact = Contact.find(params[:id])
    render json: @contact
  end

  def new
    @contact = Contact.new
    render json: @contact
  end

  def create
    @contact = Contact.new(contact_params)
    if @contact.save
      redirect_to contact_path(@contact)
    else
      render json: { errors: @contact.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
    @contact = Contact.find(params[:id])
    render json: @contact
  end

  def update
    @contact = Contact.find(params[:id])
    if @contact.update(contact_params)
      redirect_to contact_path(@contact)
    else
      render json: { errors: @contact.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @contact = Contact.find(params[:id])
    @contact.destroy
    render json: @contact
  end

  private

  def contact_params
    if params[:contact].is_a? String
      Rack::Utils.parse_nested_query(params[:contact])
    else
      params.require(:contact).permit(:name_first, :name_first, :avatar, :twitter_handle, :notes, :favorite, :user_id)
    end
  end
end