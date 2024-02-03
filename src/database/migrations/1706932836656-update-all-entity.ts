import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAllEntity1706932836656 implements MigrationInterface {
    name = 'UpdateAllEntity1706932836656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" integer, "recipientId" integer, "last_message_sent" integer, CONSTRAINT "REL_3a608098e0ab9bf5f8f54c4a09" UNIQUE ("last_message_sent"), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_761a5583cb503b1124b174e13f" ON "conversations" ("creatorId", "recipientId") `);
        await queryRunner.query(`CREATE TABLE "message_attachments" ("key" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageId" integer, CONSTRAINT "PK_9de5ce0a23e3a6122e00df61a0c" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "content" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "conversationId" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_message_attachments" ("key" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageId" integer, CONSTRAINT "PK_1d65657406e6a760f57064818db" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "group_messages" ("id" SERIAL NOT NULL, "content" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "groupId" integer, CONSTRAINT "PK_f4b396868f303fa38023b61d742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "groups" ("id" SERIAL NOT NULL, "title" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "avatar" character varying, "creatorId" integer, "ownerId" integer, "last_message_sent" integer, CONSTRAINT "REL_4147c690073a1c217af1169841" UNIQUE ("last_message_sent"), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "peer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_3a3bede69c11e056079aaece6db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friend_requests" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "senderId" integer, "receiverId" integer, CONSTRAINT "PK_3827ba86ce64ecb4b90c92eeea6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friends" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "receiverId" integer, CONSTRAINT "PK_65e1b06a9f379ee5255054021e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "groups_users_users" ("groupsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_8dee02fc8de57bffcccce22565d" PRIMARY KEY ("groupsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6320d5cbd6f7702b2e78d38d6b" ON "groups_users_users" ("groupsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f3881cfe1ef94b0e435d1d72f" ON "groups_users_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "peerId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_a83e922d84fbcf82219c7fb3cc6" UNIQUE ("peerId")`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_3a608098e0ab9bf5f8f54c4a093" FOREIGN KEY ("last_message_sent") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_attachments" ADD CONSTRAINT "FK_5b4f24737fcb6b35ffdd4d16e13" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_819e6bb0ee78baf73c398dc707f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_message_attachments" ADD CONSTRAINT "FK_e3e4b147713098bbc5a3948c24b" FOREIGN KEY ("messageId") REFERENCES "group_messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_a2d00b52e4e18a3686d68a155c0" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_8f9e67acada60b6ae7096c4f15f" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_4147c690073a1c217af1169841b" FOREIGN KEY ("last_message_sent") REFERENCES "group_messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a83e922d84fbcf82219c7fb3cc6" FOREIGN KEY ("peerId") REFERENCES "peer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups_users_users" ADD CONSTRAINT "FK_6320d5cbd6f7702b2e78d38d6b8" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_users_users" ADD CONSTRAINT "FK_0f3881cfe1ef94b0e435d1d72f9" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups_users_users" DROP CONSTRAINT "FK_0f3881cfe1ef94b0e435d1d72f9"`);
        await queryRunner.query(`ALTER TABLE "groups_users_users" DROP CONSTRAINT "FK_6320d5cbd6f7702b2e78d38d6b8"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a83e922d84fbcf82219c7fb3cc6"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_4147c690073a1c217af1169841b"`);
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_8f9e67acada60b6ae7096c4f15f"`);
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_a2d00b52e4e18a3686d68a155c0"`);
        await queryRunner.query(`ALTER TABLE "group_message_attachments" DROP CONSTRAINT "FK_e3e4b147713098bbc5a3948c24b"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_819e6bb0ee78baf73c398dc707f"`);
        await queryRunner.query(`ALTER TABLE "message_attachments" DROP CONSTRAINT "FK_5b4f24737fcb6b35ffdd4d16e13"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_3a608098e0ab9bf5f8f54c4a093"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_a83e922d84fbcf82219c7fb3cc6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "peerId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f3881cfe1ef94b0e435d1d72f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6320d5cbd6f7702b2e78d38d6b"`);
        await queryRunner.query(`DROP TABLE "groups_users_users"`);
        await queryRunner.query(`DROP TABLE "friends"`);
        await queryRunner.query(`DROP TABLE "friend_requests"`);
        await queryRunner.query(`DROP TABLE "peer"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP TABLE "group_messages"`);
        await queryRunner.query(`DROP TABLE "group_message_attachments"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "message_attachments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_761a5583cb503b1124b174e13f"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
    }

}
