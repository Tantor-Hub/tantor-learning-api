import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../src/chat/chat.service';
import { getModelToken } from '@nestjs/sequelize';
import { Chat } from '../src/models/model.chat';
import { Users } from '../src/models/model.users';
import { Op } from 'sequelize';

describe('ChatService', () => {
  let service: ChatService;
  let chatModel: typeof Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Chat),
          useValue: {
            findAll: jest.fn(),
            findByPk: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
          },
        },
        {
          provide: getModelToken(Users),
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatModel = module.get<typeof Chat>(getModelToken(Chat));
  });

  describe('findByUser', () => {
    it('should return chats where user is sender or receiver and status is ALIVE', async () => {
      const userId = 'user-uuid-1';
      const mockChats = [{ id: 'chat1' }, { id: 'chat2' }];
      jest.spyOn(chatModel, 'findAll').mockResolvedValue(mockChats as any);

      const result = await service.findByUser(userId);

      expect(chatModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: [
              { id_user_sender: userId },
              { id_user_receiver: { [Op.contains]: userId } },
            ],
            status: 'alive',
          }),
        }),
      );
      expect(result.data.rows).toEqual(mockChats);
    });
  });

  describe('findDeletedByUser', () => {
    it('should return deleted chats where user is sender or receiver and not hidden', async () => {
      const userId = 'user-uuid-1';
      const mockDeletedChats = [{ id: 'chat3' }];
      jest
        .spyOn(chatModel, 'findAll')
        .mockResolvedValue(mockDeletedChats as any);

      const result = await service.findDeletedByUser(userId);

      expect(chatModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'deleted',
            [Op.and]: [
              {
                [Op.or]: [
                  { id_user_sender: userId },
                  { id_user_receiver: { [Op.contains]: userId } },
                ],
              },
              {
                [Op.or]: [
                  { dontshowme: null },
                  { dontshowme: { [Op.not]: { [Op.contains]: userId } } },
                ],
              },
            ],
          }),
        }),
      );
      expect(result.data.rows).toEqual(mockDeletedChats);
    });
  });
});
