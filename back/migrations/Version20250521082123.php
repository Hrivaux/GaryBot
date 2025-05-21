<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250521082123 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F844ED5CA9E6
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE concessions (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, city VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, zipcode VARCHAR(255) NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE operations (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, category VARCHAR(255) NOT NULL, additionnal_help VARCHAR(255) DEFAULT NULL, additionnal_comment VARCHAR(255) DEFAULT NULL, time_unit INT NOT NULL, price INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE parametre_user DROP FOREIGN KEY FK_9E37452FA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE chat_message DROP FOREIGN KEY FK_FAB3FC16613FECDF
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE chat_session
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE parametre_user
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE service
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE chat_message
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F844545317D1
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_FE38F844545317D1 ON appointment
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_FE38F844ED5CA9E6 ON appointment
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD start_time DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', ADD end_time DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', ADD is_booked TINYINT(1) NOT NULL, DROP vehicle_id, DROP service_id, DROP client_name, DROP client_phone, DROP scheduled_at, DROP created_at, DROP status
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD lastname VARCHAR(255) DEFAULT NULL, ADD street VARCHAR(255) DEFAULT NULL, ADD postalcode VARCHAR(255) DEFAULT NULL, ADD city VARCHAR(255) DEFAULT NULL, ADD country VARCHAR(255) DEFAULT NULL, ADD created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', DROP first_name, DROP last_name, DROP address_street, DROP address_postal_code, DROP address_city, DROP address_country, CHANGE email email VARCHAR(255) NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', CHANGE phone phone VARCHAR(255) DEFAULT NULL, CHANGE avatar_name firstname VARCHAR(255) DEFAULT NULL, CHANGE profile_complete profile_completed TINYINT(1) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E486A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_1B80E486A76ED395 ON vehicle
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle ADD date_mise_circulation DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', DROP date_mise_en_circulation, CHANGE immat immat VARCHAR(255) NOT NULL, CHANGE marque marque VARCHAR(255) NOT NULL, CHANGE modele modele VARCHAR(255) NOT NULL, CHANGE energie energie VARCHAR(255) DEFAULT NULL, CHANGE carrosserie carrosserie VARCHAR(255) DEFAULT NULL, CHANGE boite_vitesse boite_vitesse VARCHAR(255) DEFAULT NULL, CHANGE nom_commercial nom_commercial VARCHAR(255) DEFAULT NULL, CHANGE vin vin VARCHAR(255) DEFAULT NULL, CHANGE couleur couleur VARCHAR(255) DEFAULT NULL, CHANGE kilometres km INT DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE chat_session (id INT AUTO_INCREMENT NOT NULL, started_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE parametre_user (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, site_color VARCHAR(10) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, font VARCHAR(20) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, layout_width VARCHAR(10) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, logo_url VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, dark_mode TINYINT(1) NOT NULL, show_footer TINYINT(1) NOT NULL, button_style VARCHAR(20) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, UNIQUE INDEX UNIQ_9E37452FA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE service (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, description LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, price NUMERIC(8, 2) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE chat_message (id INT AUTO_INCREMENT NOT NULL, session_id INT NOT NULL, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, author VARCHAR(10) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, sent_at DATETIME NOT NULL, INDEX IDX_FAB3FC16613FECDF (session_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE parametre_user ADD CONSTRAINT FK_9E37452FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE chat_message ADD CONSTRAINT FK_FAB3FC16613FECDF FOREIGN KEY (session_id) REFERENCES chat_session (id)
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE concessions
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE operations
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD vehicle_id INT NOT NULL, ADD service_id INT NOT NULL, ADD client_name VARCHAR(128) NOT NULL, ADD client_phone VARCHAR(32) NOT NULL, ADD scheduled_at DATETIME NOT NULL, ADD created_at DATETIME NOT NULL, ADD status VARCHAR(20) NOT NULL, DROP start_time, DROP end_time, DROP is_booked
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD CONSTRAINT FK_FE38F844545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD CONSTRAINT FK_FE38F844ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FE38F844545317D1 ON appointment (vehicle_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FE38F844ED5CA9E6 ON appointment (service_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle ADD date_mise_en_circulation DATETIME DEFAULT NULL, DROP date_mise_circulation, CHANGE immat immat VARCHAR(15) NOT NULL, CHANGE marque marque VARCHAR(50) NOT NULL, CHANGE modele modele VARCHAR(100) NOT NULL, CHANGE energie energie VARCHAR(20) DEFAULT NULL, CHANGE carrosserie carrosserie VARCHAR(50) DEFAULT NULL, CHANGE boite_vitesse boite_vitesse VARCHAR(10) DEFAULT NULL, CHANGE nom_commercial nom_commercial VARCHAR(100) DEFAULT NULL, CHANGE vin vin VARCHAR(30) DEFAULT NULL, CHANGE couleur couleur VARCHAR(30) DEFAULT NULL, CHANGE km kilometres INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E486A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_1B80E486A76ED395 ON vehicle (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD avatar_name VARCHAR(255) DEFAULT NULL, ADD first_name VARCHAR(100) DEFAULT NULL, ADD last_name VARCHAR(100) DEFAULT NULL, ADD address_street VARCHAR(255) NOT NULL, ADD address_postal_code VARCHAR(50) NOT NULL, ADD address_city VARCHAR(100) NOT NULL, ADD address_country VARCHAR(2) NOT NULL, DROP firstname, DROP lastname, DROP street, DROP postalcode, DROP city, DROP country, DROP created_at, CHANGE email email VARCHAR(180) NOT NULL, CHANGE phone phone VARCHAR(20) DEFAULT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL, CHANGE profile_completed profile_complete TINYINT(1) NOT NULL
        SQL);
    }
}
