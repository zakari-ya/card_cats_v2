-- Fichier: sql/create_and_insert_tables.sql
-- Création et insertion d'exemples pour les tables: cats, dogs, mos
-- Base: MySQL / MariaDB

DROP DATABASE IF EXISTS `my_sql`;
CREATE DATABASE `my_sql` CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_general_ci';
USE `my_sql`;

-- Table: cats
DROP TABLE IF EXISTS `cats`;
CREATE TABLE `cats` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `tag` VARCHAR(50) DEFAULT NULL,
  `descrpt` TEXT DEFAULT NULL,
  `img` VARCHAR(2083) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: dogs
DROP TABLE IF EXISTS `dogs`;
CREATE TABLE `dogs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `tag` VARCHAR(50) DEFAULT NULL,
  `descrpt` TEXT DEFAULT NULL,
  `img` VARCHAR(2083) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: mos
-- (Le nom "mos" est utilisé tel quel selon votre demande)
DROP TABLE IF EXISTS `mos`;
CREATE TABLE `mos` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `tag` VARCHAR(50) DEFAULT NULL,
  `descrpt` TEXT DEFAULT NULL,
  `img` VARCHAR(2083) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERT d'exemples pour `cats`
INSERT INTO `cats` (`name`,`tag`,`descrpt`,`img`) VALUES
('Mimi','tabby','Chat affectueux, aime dormir au soleil','https://example.com/img/cats/mimi.jpg'),
('Luna','siamese','Très curieuse, joue avec des pelotes','https://example.com/img/cats/luna.jpg'),
('Choco','black','Calme et câlin','https://example.com/img/cats/choco.jpg');

-- INSERT d'exemples pour `dogs`
INSERT INTO `dogs` (`name`,`tag`,`descrpt`,`img`) VALUES
('Rex','labrador','Joueur et énergique, adore la plage','https://example.com/img/dogs/rex.jpg'),
('Bella','bulldog','Tranquille, bonne garde','https://example.com/img/dogs/bella.jpg'),
('Toto','beagle','Curieux, excellent nez','https://example.com/img/dogs/toto.jpg');

-- INSERT d'exemples pour `mos`
INSERT INTO `mos` (`name`,`tag`,`descrpt`,`img`) VALUES
('Mosa','swarm','Groupe d''insectes imaginaire','https://example.com/img/mos/mosa.jpg'),
('Mosquito','fly','Petit insecte, volant la nuit','https://example.com/img/mos/mosquito.jpg'),
('Mossy','green','Créature végétale douce','https://example.com/img/mos/mossy.jpg');

-- Quelques sélections d'exemple
SELECT 'cats' AS `table`, COUNT(*) AS `count` FROM `cats`;
SELECT 'dogs' AS `table`, COUNT(*) AS `count` FROM `dogs`;
SELECT 'mos' AS `table`, COUNT(*) AS `count` FROM `mos`;
