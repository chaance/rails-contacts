class AuthenticationController < ApplicationController
  skip_before_action :authenticate_request

  def login
    params = auth_user_params
    email = params["email"]
    password = params["password"]
    user = User.find_by(email: email)
    if user && user.authenticate(password)
      token = jwt_encode(user_id: user.id)
      render json: { token: token }, status: :ok
    else
      render json: { errors: ['Unauthorized'], params: params, email: email }, status: :unauthorized
    end
  end

  private
  def auth_user_params
    if params[:user].is_a? String
        Rack::Utils.parse_nested_query(params[:user])
    else
      params.require(:user).permit(:email, :password)
    end
  end
end
