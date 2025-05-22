<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250522103323 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD garage_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment ADD CONSTRAINT FK_FE38F844C4FFF555 FOREIGN KEY (garage_id) REFERENCES concessions (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FE38F844C4FFF555 ON appointment (garage_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F844C4FFF555
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_FE38F844C4FFF555 ON appointment
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE appointment DROP garage_id
        SQL);
    }
}
