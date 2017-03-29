# new-mpin-client

## Getting Started

##### 1. Clone this repository and change directory

        $ git clone git@github.com:CertiVox-i3-NTT/incubator-milagro-mfa-empin-js-client.git
        $ cd incubator-milagro-mfa-empin-js-client/

##### 2. Install package via npm

        $ sudo npm install

##### 3. Create settings.json by copying default file, and edit for your environment.

        $ cp settings.json.default settings.json
        $ vi settings.json

##### 4. Install grunt if you haven't yet

        $ npm install -g grunt-cli

    (see http://gruntjs.com/getting-started)

##### 5. Install rubygems if you haven't yet

        $ yum install rubygems

##### 6. Install sass if you haven't yet

        $ gem install sass
    
    (sass is used for grunt task, see https://github.com/gruntjs/grunt-contrib-sass)

##### 7. Get mpin.js from git@github.com:CertiVox-i3-NTT/incubator-milagro-mfa-js-lib.git.
    
        $ cd <incubator-milagro-mfa-js-lib>
        $ npm install
        $ grunt build
        $ cp dist/mpinjs.js <incubator-milagro-mfa-empin-js-client>/lib/mpin/

##### 8. Run grunt (js and css file will be installed to target directory)

        $ grunt
        
    Run with ' debug' for development.

##### 9. (For webapp) Include js and css stylesheet in html source you build MPIN Client in.

```html
    <link href="css/mpin.min.css" rel="stylesheet">
    <script src="js/mpin.js"></script>
```

js and css which the public server hosts, are also available!
```html
    <link href="https://public.ellipticauth.com/public/css/mpin.min.css" rel="stylesheet">
    <script src="https://public.ellipticauth.com/public/js/mpin.js"></script>
```

##### 10. (Option) (For webapp) Add button tag in html source.

```html    
    <button type="button" id="mpinLoginButton">MPIN Login</button>
```
    (Add button tag with id "mpinLoginButton". Anywhere OK)

##### 11. (Option) (For webapp) If you change settings, add client tag in html source.
```html
    <div id="mpinClient" data-mpin-initial-showing="on" data-mpin-skip-user-id-validation="on" data-mpin-pin-max-length="10" data-mpin-pin-min-length="4" data-mpin-language="en" data-mpin-rpa-base-url="http://public.ellipticauth.com" data-mpin-image-base-url="https://public.ellipticauth.com/public/images" data-mpin-form-id="login-form" data-mpin-username-id="username" data-mpin-password-id="password"
    ></div>
```


##### 12. (For RPA Server) Copy image resources to RPA server. Use git@github.com:CertiVox-i3-NTT/incubator-milagro-mfa-golang-rpa-server.git for RPA server.
    
        $ cd <incubator-milagro-mfa-empin-js-client>
        $ cp dist/img/* <incubator-milagro-mfa-golang-rpa-server>/public/images
        
    (Client get images from 'imageBaseURL' of settings.json)
    ex) imageBaseURL: "http://<rpa go server>/public/images"

## Testing Client

##### 1 ~ 7. same as 'Getting Started'

##### 8. Run grunt

        $ grunt debug &
        $ grunt test
##### 9. Open testing page(http://<hostname>:9000/test/all.html) in Web Browser

    Port can changable.
    Some test need other M-PIN server(rps, dta, ...
