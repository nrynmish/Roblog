
import logging
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import MongoClient, DESCENDING
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, OperationFailure
import certifi
from config.settings import settings

logger = logging.getLogger(__name__)


class MongoDB:

    def __init__(self):
        self.client     = None
        self.db         = None
        self.blogs      = None   # blogs 
        self.is_connected = False

    def connect(self):
        try:
            logger.info("Connecting to MongoDB...")

            self.client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
            )

            
            self.client.admin.command("ping")

            self.db    = self.client[settings.MONGO_DB_NAME]
            self.blogs = self.db["blogs"]

            self._create_indexes()

            self.is_connected = True
            logger.info(f"MongoDB connected — DB: {settings.MONGO_DB_NAME}")

        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {str(e)}")
            raise RuntimeError(f"MongoDB connection failed: {str(e)}")

        except Exception as e:
            logger.error(f"Unexpected DB error: {str(e)}")
            raise RuntimeError(f"Database error: {str(e)}")

    def disconnect(self):
        if self.client:
            self.client.close()
            self.is_connected = False
            logger.info("MongoDB disconnected")

    def _create_indexes(self):
        self.blogs.create_index("keyword")
        self.blogs.create_index("created_at")
        self.blogs.create_index([("created_at", DESCENDING)])
        logger.info("✅ MongoDB indexes created")

    def insert_blog(self, blog_data: dict) -> str:
 
        self._check_connection()

        try:
            # Add timestamps
            blog_data["created_at"] = datetime.now(timezone.utc)
            blog_data["updated_at"] = datetime.now(timezone.utc)

            result = self.blogs.insert_one(blog_data)
            inserted_id = str(result.inserted_id)

            logger.info(f"Blog inserted — ID: {inserted_id}")
            return inserted_id

        except Exception as e:
            logger.error(f"Insert failed: {str(e)}")
            raise RuntimeError(f"Failed to insert blog: {str(e)}")

    def get_blog_by_id(self, blog_id: str) -> dict | None:
        self._check_connection()
        try:
            if not ObjectId.is_valid(blog_id):
                raise ValueError(f"Invalid blog ID format: {blog_id}")
            document = self.blogs.find_one({"_id": ObjectId(blog_id)})
            if document:
                document["_id"] = str(document["_id"])
                document = self._serialize_doc(document)  # ← add this
                return document
            return None
        except ValueError as e:
            raise
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve blog: {str(e)}")
        self._check_connection()

        try:
            # Validate ObjectId format
            if not ObjectId.is_valid(blog_id):
                raise ValueError(f"Invalid blog ID format: {blog_id}")

            document = self.blogs.find_one({"_id": ObjectId(blog_id)})

            if document:
                document["_id"] = str(document["_id"])  # Convert ObjectId to string
                logger.info(f"✅ Blog retrieved — ID: {blog_id}")
                return document

            logger.warning(f"Blog not found — ID: {blog_id}")
            return None

        except ValueError as e:
            raise
        except Exception as e:
            logger.error(f"❌ Retrieval failed: {str(e)}")
            raise RuntimeError(f"Failed to retrieve blog: {str(e)}")

    def get_all_blogs(self, limit: int = 20) -> list:
        self._check_connection()
        try:
            cursor = self.blogs.find(
                {},
                {"content": 0}
            ).sort("created_at", DESCENDING).limit(limit)

            blogs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                doc = self._serialize_doc(doc)  # ← add this
                blogs.append(doc)

            return blogs
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve blogs: {str(e)}")
        self._check_connection()

        try:
            cursor = self.blogs.find(
                {},
                # Exclude heavy content field for list view
                {"content": 0}
            ).sort("created_at", DESCENDING).limit(limit)

            blogs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                blogs.append(doc)

            logger.info(f"✅ Retrieved {len(blogs)} blogs")
            return blogs

        except Exception as e:
            logger.error(f"❌ Failed to retrieve blogs: {str(e)}")
            raise RuntimeError(f"Failed to retrieve blogs: {str(e)}")

    def get_blogs_by_keyword(self, keyword: str) -> list:
        self._check_connection()

        try:
            cursor = self.blogs.find(
                {"keyword": keyword.lower().strip()},
                {"content": 0}
            ).sort("created_at", DESCENDING)

            blogs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                blogs.append(doc)

            logger.info(f"Found {len(blogs)} blogs for keyword: {keyword}")
            return blogs

        except Exception as e:
            logger.error(f"Keyword search failed: {str(e)}")
            raise RuntimeError(f"Failed to search blogs: {str(e)}")

    def delete_blog(self, blog_id: str) -> bool:

        self._check_connection()

        try:
            if not ObjectId.is_valid(blog_id):
                raise ValueError(f"Invalid blog ID: {blog_id}")

            result = self.blogs.delete_one({"_id": ObjectId(blog_id)})

            if result.deleted_count > 0:
                logger.info(f"Blog deleted — ID: {blog_id}")
                return True

            logger.warning(f"Blog not found for deletion — ID: {blog_id}")
            return False

        except Exception as e:
            logger.error(f"Delete failed: {str(e)}")
            raise RuntimeError(f"Failed to delete blog: {str(e)}")


    def health(self) -> dict:
        """Returns DB connection status."""
        return {
            "connected":   self.is_connected,
            "database":    settings.MONGO_DB_NAME,
            "collections": ["blogs"] if self.is_connected else []
        }

    def _serialize_doc(self, doc: dict) -> dict:
            """Convert MongoDB document fields to JSON-serializable types."""
            for key, value in doc.items():
                if hasattr(value, 'isoformat'):  # datetime objects
                    doc[key] = value.isoformat()
            return doc

    def _check_connection(self):
        """Raise error if DB is not connected."""
        if not self.is_connected or self.blogs is None:
            raise RuntimeError("Database is not connected.")


mongo = MongoDB()


def connect_db():
    mongo.connect()

def disconnect_db():
    mongo.disconnect()