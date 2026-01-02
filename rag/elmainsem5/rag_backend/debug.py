import chromadb

client = chromadb.PersistentClient(path="./chroma_store")

for c in client.list_collections():
    print(c.name)
