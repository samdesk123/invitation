import sys
from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from langchain_openai import OpenAI  # Make sure you have this package installed
from dotenv import load_dotenv

load_dotenv()

question = sys.argv[1] if len(sys.argv) > 1 else "How many guest coming who are coming with children?"

db_uri = "mysql+mysqlconnector://root:Shubham%402024@104.154.236.11:3306/weeding_invitation"
db = SQLDatabase.from_uri(db_uri)
llm = OpenAI(temperature=0)
db_chain = SQLDatabaseChain.from_llm(llm, db, verbose=False)

response = db_chain.run(question)
print(response)