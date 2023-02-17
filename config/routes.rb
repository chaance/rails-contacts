latest_api_version = '1'
Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root "contacts#index"
  resources :users
  resources :contacts
  post 'auth/login', to: 'authentication#login'
end
