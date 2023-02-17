class UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [:show, :index]

  def index
    @users = User.all
    render json: @users.map { |x| get_public_user(x) }
  end

  def show
    render json: get_public_user(@user)
  end

  def new
    @user = User.new
    render json: get_public_user(@user)
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to contact_path(@user)
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
    @user = User.find(params[:id])
    render json: get_public_user(@user)
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      redirect_to contact_path(@user)
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy
    render json: get_public_user(@user)
  end

  private
  def user_params
    if params[:user].is_a? String
      Rack::Utils.parse_nested_query(params[:user])
    else
      params.require(:user).permit(:email, :password, :password_confirmation, :name_first, :name_last)
    end
  end

  private
  def get_public_user(user)
    { id: user.id, name_first: user.name_first, name_last: user.name_last, email: user.email }
  end
end
