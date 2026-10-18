/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.29-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ruralcare
-- ------------------------------------------------------
-- Server version	10.5.29-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ruralcare`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ruralcare_source` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;

USE `ruralcare_source`;

--
-- Table structure for table `ambulances`
--

DROP TABLE IF EXISTS `ambulances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ambulances` (
  `ambulance_id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_number` varchar(20) NOT NULL,
  `driver_name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Available',
  PRIMARY KEY (`ambulance_id`),
  UNIQUE KEY `vehicle_number` (`vehicle_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ambulances`
--

LOCK TABLES `ambulances` WRITE;
/*!40000 ALTER TABLE `ambulances` DISABLE KEYS */;
INSERT INTO `ambulances` VALUES (1,'MH01AB1234','Amit Patil','9000000001','Village Centre','Available'),(2,'MH01AB5678','Rahul Sharma','9000000002','North Village','Available');
/*!40000 ALTER TABLE `ambulances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_requests`
--

DROP TABLE IF EXISTS `emergency_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_requests` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `emergency_type` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `hospital_id` int(11) DEFAULT NULL,
  `ambulance_id` int(11) DEFAULT NULL,
  `request_status` varchar(30) NOT NULL DEFAULT 'Pending',
  `request_time` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`request_id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `ambulance_id` (`ambulance_id`),
  CONSTRAINT `emergency_requests_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`hospital_id`),
  CONSTRAINT `emergency_requests_ibfk_2` FOREIGN KEY (`ambulance_id`) REFERENCES `ambulances` (`ambulance_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_requests`
--

LOCK TABLES `emergency_requests` WRITE;
/*!40000 ALTER TABLE `emergency_requests` DISABLE KEYS */;
INSERT INTO `emergency_requests` VALUES (1,'Demo Patient','9000000003','Medical Emergency','Village Centre',1,1,'Assigned','2026-10-18 09:50:42');
/*!40000 ALTER TABLE `emergency_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitals` (
  `hospital_id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_name` varchar(150) NOT NULL,
  `location` varchar(255) NOT NULL,
  `specialties` varchar(255) DEFAULT NULL,
  `total_beds` int(11) NOT NULL DEFAULT 0,
  `available_beds` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`hospital_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitals`
--

LOCK TABLES `hospitals` WRITE;
/*!40000 ALTER TABLE `hospitals` DISABLE KEYS */;
INSERT INTO `hospitals` VALUES (1,'RuralCare General Hospital','Village Centre','General Medicine',100,35),(2,'Community Health Centre','North Village','Emergency Care',50,18);
/*!40000 ALTER TABLE `hospitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `medicine_id` int(11) NOT NULL AUTO_INCREMENT,
  `medicine_name` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `expiry_date` date DEFAULT NULL,
  `storage_location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medicine_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,'Paracetamol','Pain Relief',200,'2027-12-31','Health Centre Store'),(2,'First Aid Bandages','First Aid',100,'2028-06-30','Emergency Store');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roads`
--

DROP TABLE IF EXISTS `roads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roads` (
  `road_id` int(11) NOT NULL AUTO_INCREMENT,
  `road_name` varchar(150) NOT NULL,
  `location` varchar(255) NOT NULL,
  `road_condition` varchar(50) DEFAULT 'Good',
  `accessibility` varchar(50) DEFAULT 'Open',
  PRIMARY KEY (`road_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roads`
--

LOCK TABLES `roads` WRITE;
/*!40000 ALTER TABLE `roads` DISABLE KEYS */;
INSERT INTO `roads` VALUES (1,'Main Village Road','Village Centre','Good','Open'),(2,'North Village Road','North Village','Damaged','Restricted');
/*!40000 ALTER TABLE `roads` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 10:02:34

