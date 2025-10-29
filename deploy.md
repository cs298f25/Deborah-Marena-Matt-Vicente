# Deploy.md file
## Deploy Locally
1. Create a Virtual Environment using `python3 -m venv .venv`
2. Active the Virtual Enviroment using `source .venv/bin/activate` on Mac or `.venv\Scripts\activate` on Windows
3. Install Dependencies using `pip install -r requirements.txt`
4. Run the Application using `python app.py`
## Deploy On AWS
1. Create your EC2 Instance on AWS
2. SSH into your created instance
3. Type `sudo yum install -y git` in the console
4. Clone the repo into your EC2 instance using `git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git`

