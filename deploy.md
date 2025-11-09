# Deploy.md file
## Deploy Locally
1. Create a Virtual Environment using `python3 -m venv .venv`
2. Active the Virtual Enviroment using `source .venv/bin/activate` on Mac/Linux or `.venv\Scripts\activate` on Windows
3. In the terminal type `cd bytepath-backend`
4. Install Dependencies using `pip install -r requirements.txt`
5. Run the Application using `python app.py`
6. Run `npm install`
7. Run `npm run dev`
8. Click on the local host network that was given

## Deploy On AWS
1. Create your EC2 Instance on AWS
2. SSH into your created instance
3. Type `sudo yum install -y git` in the console
4. Clone the repo into your EC2 instance using `git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git`
5. Create a Virtual Environment using `python3 -m venv .venv`
6. Active the Virtual Enviroment using `source .venv/bin/activate`
7. Install Dependencies using `pip install -r requirements.txt`

